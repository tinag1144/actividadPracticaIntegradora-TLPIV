import { type RoleName } from "../../models/interfaces/IRole.interface.js";

// Public view of a user: never includes the password hash.
export interface IUserAccount {
  id: string;
  email: string;
  role: RoleName;
  permissions: string[];
}
