import { type Request, type Response } from "express";
import { isRoleName, type UserService } from "../services/UserService.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

// Errors thrown here are forwarded by Express 5 to the errorHandler middleware.
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async list(_req: Request, res: Response): Promise<void> {
    const users = await this.userService.list();
    res.status(200).json(users);
  }

  async assignRole(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userId = req.params.id;
    if (typeof userId !== "string" || !userId) {
      throw new BadRequestError("User id is required");
    }

    const body: unknown = req.body;
    const role = typeof body === "object" && body !== null && "role" in body ? body.role : undefined;

    if (!isRoleName(role)) {
      throw new BadRequestError("role must be one of: admin, operador, usuario");
    }

    const user = await this.userService.assignRole(req.user.id, userId, role);
    res.status(200).json(user);
  }
}
