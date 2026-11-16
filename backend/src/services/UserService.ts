import { type IUserRepository } from "../repositories/interfaces/IUserRepository.js";
import { type IRoleRepository } from "../repositories/interfaces/IRoleRepository.js";
import { type RoleName } from "../models/interfaces/IRole.interface.js";
import { type IUserAccount } from "./interfaces/IUserAccount.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

const ROLE_NAMES: readonly RoleName[] = ["admin", "operador", "usuario"];

export const isRoleName = (value: unknown): value is RoleName =>
  typeof value === "string" && (ROLE_NAMES as readonly string[]).includes(value);

export class UserService {
  private userRepository: IUserRepository;
  private roleRepository: IRoleRepository;

  constructor(userRepository: IUserRepository, roleRepository: IRoleRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  async getById(id: string): Promise<IUserAccount> {
    const user = await this.userRepository.findAccountById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async list(): Promise<IUserAccount[]> {
    return this.userRepository.findAllAccounts();
  }

  async assignRole(requesterId: string, userId: string, roleName: RoleName): Promise<IUserAccount> {
    if (requesterId === userId) {
      throw new BadRequestError("You cannot change your own role");
    }

    const role = await this.roleRepository.findByName(roleName);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    const updated = await this.userRepository.updateRole(userId, role._id);
    if (!updated) {
      throw new NotFoundError("User not found");
    }

    return updated;
  }
}
