import type { Types } from "mongoose";
import { type IUser } from "../../models/interfaces/IUser.interface.js";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(data: { email: string; password: string; role: Types.ObjectId }): Promise<IUser>;
};
