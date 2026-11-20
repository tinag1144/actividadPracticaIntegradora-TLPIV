import { Router, type RequestHandler } from "express";
import type { NotificationController } from "../controllers/NotificationController.js";
import { authorize } from "../middlewares/authorize.js";

export const createNotificationRouter = (controller: NotificationController, authenticate: RequestHandler): Router => {
  const router = Router();
  router.use(authenticate, authorize("notification:read"));
  router.get("/", (req, res) => controller.list(req, res));
  router.get("/unread-count", (req, res) => controller.countUnread(req, res));
  router.patch("/:id/read", (req, res) => controller.markAsRead(req, res));
  return router;
};
