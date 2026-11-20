import { type IRole, type RoleName } from "../../models/interfaces/IRole.interface.js";

export interface IRoleRepository {
  findByName(name: RoleName): Promise<IRole | null>;
}
