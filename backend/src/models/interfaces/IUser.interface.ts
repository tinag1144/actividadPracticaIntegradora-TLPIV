import { type Document } from "mongoose";

type Role = 'admin' | 'operador' | 'usuario';

export interface IUser extends Document {
  username: string;
  password: string;
  role: Role;
}
