import { type IRoleRepository } from "./interfaces/IRoleRepository.js";
import { type IRole, type RoleName } from "../models/interfaces/IRole.interface.js";
import { Role } from "../models/role.model.js";

export class RoleRepository implements IRoleRepository {
  async findByName(name: RoleName): Promise<IRole | null> {
    return Role.findOne({name}).populate("permissions")
  }
}
