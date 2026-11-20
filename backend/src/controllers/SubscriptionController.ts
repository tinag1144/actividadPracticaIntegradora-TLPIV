import type { Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import type { SubscriptionService } from "../modules/subscriptions/SubscriptionService.js";

const readSubscription = (req: Request) => {
  if (!req.user) throw new UnauthorizedError("Authentication required");
  const productId = req.params.id;
  if (typeof productId !== "string" || !productId.trim()) {
    throw new BadRequestError("Product id is required");
  }
  return { userId: req.user.id, productId };
};

export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  async status(req: Request, res: Response): Promise<void> {
    const { userId, productId } = readSubscription(req);
    res.json({ subscribed: await this.service.isSubscribed(userId, productId) });
  }

  async subscribe(req: Request, res: Response): Promise<void> {
    const { userId, productId } = readSubscription(req);
    await this.service.subscribe(userId, productId);
    res.status(201).json({ subscribed: true });
  }

  async unsubscribe(req: Request, res: Response): Promise<void> {
    const { userId, productId } = readSubscription(req);
    await this.service.unsubscribe(userId, productId);
    res.sendStatus(204);
  }
}
