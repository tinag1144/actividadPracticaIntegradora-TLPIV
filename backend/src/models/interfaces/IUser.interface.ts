import { type Document, type Types } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  role: Types.ObjectId;
}
