import { Router, type RequestHandler } from "express";
import type { SubscriptionController } from "../controllers/SubscriptionController.js";
import { authorize } from "../middlewares/authorize.js";

export const createSubscriptionRouter = (controller: SubscriptionController, authenticate: RequestHandler): Router => {
  const router = Router({ mergeParams: true });
  router.get("/", authenticate, authorize("product:read"), (req, res) => controller.status(req, res));
  router.post("/", authenticate, authorize("subscription:create"), (req, res) => controller.subscribe(req, res));
  router.delete("/", authenticate, authorize("subscription:delete"), (req, res) => controller.unsubscribe(req, res));
  return router;
};
