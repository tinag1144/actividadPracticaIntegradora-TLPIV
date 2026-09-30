import { Schema, model } from "mongoose";
import { type IRole } from "./interfaces/IRole.interface.js";

const RoleSchema = new Schema<IRole>({
  name: { type: String, required: true, unique: true },
  permissions: [{ type: Schema.Types.ObjectId, ref: "Permission" }],
});

export const Role = model<IRole>("Role", RoleSchema);
