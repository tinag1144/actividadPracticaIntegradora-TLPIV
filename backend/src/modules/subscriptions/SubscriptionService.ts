import { HttpError } from "../../errors/HttpError.js";
import type { IProductRepository } from "../products/IProductRepository.js";
import type { ISubscriptionRepository } from "./ISubscriptionRepository.js";
import { DuplicateSubscriptionError } from "./Subscription.js";

export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly productRepository: IProductRepository,
  ) {}

  async isSubscribed(userId: number, productId: string): Promise<boolean> {
    const subscription = await this.subscriptionRepository.find(
      userId,
      productId,
    );
    return subscription !== null;
  }

  async subscribe(userId: number, productId: string): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new HttpError(404, "Product not found");

    if (await this.isSubscribed(userId, productId)) {
      throw new HttpError(409, "Already subscribed to this product");
    }

    try {
      await this.subscriptionRepository.create(userId, productId);
    } catch (error) {
      if (error instanceof DuplicateSubscriptionError) {
        throw new HttpError(409, "Already subscribed to this product");
      }
      throw error;
    }
  }

  async unsubscribe(userId: number, productId: string): Promise<void> {
    const deleted = await this.subscriptionRepository.delete(userId, productId);
    if (!deleted) throw new HttpError(404, "Subscription not found");
  }
}
