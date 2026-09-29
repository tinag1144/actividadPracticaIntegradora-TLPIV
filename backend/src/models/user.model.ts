import { Schema, model } from "mongoose";
import {type IUser } from "./interfaces/user.interface.js";


export const UserModel = new Schema<IUser>(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "operador", "usuario"], required: true },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", UserModel);
