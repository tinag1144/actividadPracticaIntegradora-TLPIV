import { Router, type RequestHandler } from "express";
import { type AuthController } from "../controllers/Auth.controller.js";

export const createAuthRouter = (controller: AuthController, authenticate: RequestHandler): Router => {
  const router = Router();

  router.post("/register", (req, res) => controller.register(req, res));
  router.post("/login", (req, res) => controller.login(req, res));
  router.get("/me", authenticate, (req, res) => controller.me(req, res));

  return router;
};
