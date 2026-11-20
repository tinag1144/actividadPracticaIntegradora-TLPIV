import { Router, type RequestHandler } from "express";
import { type UserController } from "../controllers/User.controller.js";
import { authorize } from "../middlewares/authorize.js";

export const createUserRouter = (controller: UserController, authenticate: RequestHandler): Router => {
  const router = Router();

  router.use(authenticate);
  router.get("/", authorize("user:read"), (req, res) => controller.list(req, res));
  router.patch("/:id/role", authorize("user:assign-role"), (req, res) => controller.assignRole(req, res));

  return router;
};
