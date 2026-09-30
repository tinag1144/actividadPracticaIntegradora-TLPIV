import { type RoleName } from "../models/interfaces/IRole.interface.js";

export interface IRegisteredUser {
  id: string;
  email: string;
  role: RoleName;
}
