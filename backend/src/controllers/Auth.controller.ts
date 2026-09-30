import { type Request, type Response } from "express";
import { AuthService } from "../services/AuthService.js";
import { handleError } from "../errors/HandleErrors.js";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  };

  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          message: "Email and password are required"
        });
        return;
      };

      const user = await this.authService.register(email, password);
      res.status(201).json(user);
    } catch (error) {
      handleError(error, res);
    };
  };

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      };

      const result = await this.authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      handleError(error, res);
    };
  };
};
