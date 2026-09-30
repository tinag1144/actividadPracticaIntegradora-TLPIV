import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose, { type Types } from "mongoose";
import { db } from "../config/database.js";
import { PermissionModel } from "../models/permission.model.js";
import { Role } from "../models/role.model.js";
import { User } from "../models/user.model.js";
import { type RoleName } from "../models/interfaces/IRole.interface.js";

const PERMISSIONS = [
  "producto:read",
  "producto:create",
  "producto:update",
  "producto:change-status",
  "producto:delete",
  "subscription:create",
  "subscription:delete",
  "notification:read",
  "user:read",
  "user:assign-role",
];

const ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  admin: PERMISSIONS,
  operador: [
    "producto:read",
    "producto:create",
    "producto:update",
    "producto:change-status",
    "subscription:create",
    "subscription:delete",
    "notification:read",
  ],
  usuario: [
    "producto:read",
    "subscription:create",
    "subscription:delete",
    "notification:read",
  ],
};

const TEST_USERS: { email: string; password: string; role: RoleName }[] = [
  { email: "admin@tp.com", password: "Admin123!", role: "admin" },
  { email: "operador@tp.com", password: "Operador123!", role: "operador" },
  { email: "usuario@tp.com", password: "Usuario123!", role: "usuario" },
];

const seedPermissions = async (): Promise<Map<string, Types.ObjectId>> => {
  for (const name of PERMISSIONS) {
    await PermissionModel.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }
  const permissions = await PermissionModel.find({ name: { $in: PERMISSIONS } });
  return new Map(permissions.map((p) => [p.name, p._id]));
};

const seedRoles = async (permissionIds: Map<string, Types.ObjectId>): Promise<void> => {
  for (const [name, permissionNames] of Object.entries(ROLE_PERMISSIONS) as [RoleName, string[]][]) {
    const ids = permissionNames.map((permissionName) => {
      const id = permissionIds.get(permissionName);
      if (!id) throw new Error(`Permission not seeded: ${permissionName}`);
      return id;
    });
    await Role.updateOne({ name }, { $set: { permissions: ids } }, { upsert: true });
  }
};

const seedUsers = async (): Promise<void> => {
  for (const { email, password, role } of TEST_USERS) {
    if (await User.exists({ email })) continue;
    const roleDoc = await Role.findOne({ name: role }).orFail();
    const hash = await bcrypt.hash(password, 10);
    await User.create({ email, password: hash, role: roleDoc._id });
  }
};

const seed = async (): Promise<void> => {
  await db.connect(process.env.MONGO_URI as string);
  const permissionIds = await seedPermissions();
  await seedRoles(permissionIds);
  await seedUsers();
  console.log("Seed completed");
};

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
