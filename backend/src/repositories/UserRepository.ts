import { type Types } from "mongoose";
import { User } from "../models/user.model.js";
import { type IUser } from "../models/interfaces/IUser.interface.js";
import { type IUserRepository } from "./interfaces/IUserRepository.js";

const withPermissions = { path: "role", populate: { path: "permissions" } };

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).populate(withPermissions);
  }

  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).populate(withPermissions)
  }

  async create(data: {
    email: string;
    password: string;
    role: Types.ObjectId;
  }): Promise<IUser> {
    return User.create(data);
  }
}
