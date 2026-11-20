import { Schema, model } from "mongoose";
import { type IUser } from "./interfaces/IUser.interface.js";
import "./role.model.js";


export const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  },
  { timestamps: true },
);

export const User = model<IUser>("User", UserSchema);
