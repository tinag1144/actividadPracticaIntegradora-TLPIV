import type { Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import type { Notification } from "../models/interfaces/notification.interface.js";
import type { NotificationService } from "../modules/notifications/NotificationService.js";

const readUserId = (req: Request): string => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  return req.user.id;
};

const toResponse = ({ id, productId, productName, oldStatus, newStatus, message, read, createdAt }: Notification) => ({
  id, productId, productName, oldStatus, newStatus, message, read, createdAt,
});

export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  async list(req: Request, res: Response): Promise<void> {
    const notifications = await this.service.getByUserId(readUserId(req));
    res.json(notifications.map(toResponse));
  }

  async countUnread(req: Request, res: Response): Promise<void> {
    res.json({ count: await this.service.countUnread(readUserId(req)) });
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    if (typeof id !== "string" || !/^[\da-f]{24}$/i.test(id)) {
      throw new BadRequestError("Invalid notification id");
    }
    const notification = await this.service.markAsRead(id, readUserId(req));
    if (!notification) throw new NotFoundError("Notification not found");
    res.json(toResponse(notification));
  }
}
