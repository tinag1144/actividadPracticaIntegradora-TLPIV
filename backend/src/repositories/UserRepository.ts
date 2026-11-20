import { isValidObjectId, type Types } from "mongoose";
import { User } from "../models/user.model.js";
import { type IUser } from "../models/interfaces/IUser.interface.js";
import { type RoleName } from "../models/interfaces/IRole.interface.js";
import { type IUserRepository } from "./interfaces/IUserRepository.js";
import { type IUserAccount } from "../services/interfaces/IUserAccount.js";

const withPermissions = { path: "role", populate: { path: "permissions" } };

interface PopulatedRole {
  name: RoleName;
  permissions: { name: string }[];
}

interface PopulatedUser {
  _id: Types.ObjectId;
  email: string;
  role: PopulatedRole;
}

const toAccount = (user: PopulatedUser): IUserAccount => ({
  id: user._id.toHexString(),
  email: user.email,
  role: user.role.name,
  permissions: user.role.permissions.map((permission) => permission.name),
});

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).populate(withPermissions);
  }

  async findById(id: string): Promise<IUser | null> {
    if (!isValidObjectId(id)) return null;
    return User.findById(id).populate(withPermissions);
  }

  async create(data: {
    email: string;
    password: string;
    role: Types.ObjectId;
  }): Promise<IUser> {
    return User.create(data);
  }

  async findAccountById(id: string): Promise<IUserAccount | null> {
    if (!isValidObjectId(id)) return null;
    const user = await User.findById(id)
      .populate<{ role: PopulatedRole }>(withPermissions)
      .lean<PopulatedUser>();
    return user ? toAccount(user) : null;
  }

  async findAllAccounts(): Promise<IUserAccount[]> {
    const users = await User.find()
      .sort({ email: 1 })
      .populate<{ role: PopulatedRole }>(withPermissions)
      .lean<PopulatedUser[]>();
    return users.map(toAccount);
  }

  async updateRole(id: string, roleId: Types.ObjectId): Promise<IUserAccount | null> {
    if (!isValidObjectId(id)) return null;
    const user = await User.findByIdAndUpdate(id, { role: roleId }, { new: true })
      .populate<{ role: PopulatedRole }>(withPermissions)
      .lean<PopulatedUser>();
    return user ? toAccount(user) : null;
  }
}
