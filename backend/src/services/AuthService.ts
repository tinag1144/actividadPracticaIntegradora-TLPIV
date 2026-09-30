import { type IUserRepository } from "../repositories/interfaces/IUserRepository.js";
import { type IRoleRepository } from "../repositories/interfaces/IRoleRepository.js";
import { ConflictError } from "../errors/ConflictError.js";
import bcrypt from "bcrypt";
import { type IRegisteredUser } from "./interfaces/IRegisteredUser.js";


export class AuthService {
  private userRepository: IUserRepository;
  private roleRepository: IRoleRepository;

  constructor(userRepository: IUserRepository, roleRepository: IRoleRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  async register(email: string, password: string): Promise<IRegisteredUser> {
    const user = await this.userRepository.findByEmail(email);

    if (user) {
      throw new ConflictError("User already exists");
    }

    const role = await this.roleRepository.findByName("usuario");

    if (!role) {
      throw new Error("Role not found");
    }

    const SALT_ROUND: number = 10;
    const passHash = await bcrypt.hash(password, SALT_ROUND)

    const newUser = await this.userRepository.create({ email, password: passHash, role: role._id })

    return {
      id: newUser._id.toHexString(),
      email: newUser.email,
      role: role.name,
    }

  }

  async login(email: string, password: string) {

  }

}
