import { type Document, type Types } from "mongoose";

export type RoleName = "admin" | "operador" | "usuario";

export interface IRole extends Document {
  name: RoleName;
  permissions: Types.ObjectId[];
}
