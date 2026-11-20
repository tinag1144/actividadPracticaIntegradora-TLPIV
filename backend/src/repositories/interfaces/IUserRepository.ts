import type { Types } from "mongoose";
import { type IUser } from "../../models/interfaces/IUser.interface.js";
import { type IUserAccount } from "../../services/interfaces/IUserAccount.js";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(data: { email: string; password: string; role: Types.ObjectId }): Promise<IUser>;
  findAccountById(id: string): Promise<IUserAccount | null>;
  findAllAccounts(): Promise<IUserAccount[]>;
  updateRole(id: string, roleId: Types.ObjectId): Promise<IUserAccount | null>;
};
