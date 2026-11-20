import { type IUserRepository } from "../repositories/interfaces/IUserRepository.js";
import { type IRoleRepository } from "../repositories/interfaces/IRoleRepository.js";
import { ConflictError } from "../errors/ConflictError.js";
import bcrypt from "bcrypt";
import { type IRegisteredUser } from "./interfaces/IRegisteredUser.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";
import { type IUserAccount } from "./interfaces/IUserAccount.js";


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

  async login(email: string, password: string): Promise<{ token: string; user: IUserAccount }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials")
    };

    const isValidPass = await bcrypt.compare(password, user.password);

    if (!isValidPass) {
      throw new UnauthorizedError("Invalid credentials")
    };

    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;

    if (!secret || !expiresIn) {
      console.error("JWT_SECRET or JWT_EXPIRES_IN not set");
      throw new Error("Internal server error");
    }

    const userId = user._id.toHexString();
    const token = jwt.sign({ id: userId }, secret, { expiresIn: expiresIn as NonNullable<SignOptions["expiresIn"]> })

    const account = await this.userRepository.findAccountById(userId);
    if (!account) {
      throw new UnauthorizedError("Invalid credentials");
    }

    return { token, user: account }
  }

  // Validates a JWT and returns the current user with fresh permissions from the database,
  // so a role change takes effect without logging in again.
  async verifyToken(token: string): Promise<IUserAccount> {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not set");
      throw new Error("Internal server error");
    }

    let payload: string | JwtPayload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw new UnauthorizedError("Invalid or expired token");
    }

    if (typeof payload === "string" || typeof payload.id !== "string") {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const account = await this.userRepository.findAccountById(payload.id);
    if (!account) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    return account;
  }
}
