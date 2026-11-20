import { Router, type RequestHandler } from "express";
import type { ProductController } from "../controllers/ProductController.js";
import { authorize } from "../middlewares/authorize.js";

export const createProductRouter = (controller: ProductController, authenticate: RequestHandler): Router => {
  const router = Router();
  router.use(authenticate);
  router.get("/", authorize("product:read"), (req, res) => controller.list(req, res));
  router.get("/:id", authorize("product:read"), (req, res) => controller.detail(req, res));
  router.post("/", authorize("product:create"), (req, res) => controller.create(req, res));
  router.patch("/:id", authorize("product:update"), (req, res) => controller.update(req, res));
  router.patch("/:id/status", authorize("product:change-status"), (req, res) => controller.changeStatus(req, res));
  router.delete("/:id", authorize("product:delete"), (req, res) => controller.delete(req, res));
  return router;
};
