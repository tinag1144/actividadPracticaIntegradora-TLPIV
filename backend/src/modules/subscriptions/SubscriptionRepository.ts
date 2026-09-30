import { SubscriptionModel } from "../../models/subscription.model.js";
import type { ISubscriptionRepository } from "./ISubscriptionRepository.js";
import {
  DuplicateSubscriptionError,
  type Subscription,
} from "./Subscription.js";

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000;

export class SubscriptionRepository implements ISubscriptionRepository {
  async find(userId: number, productId: string): Promise<Subscription | null> {
    return SubscriptionModel.findOne({ userId, productId })
      .select({ _id: 0, userId: 1, productId: 1, createdAt: 1, updatedAt: 1 })
      .lean<Subscription>()
      .exec();
  }

  async findByProductId(productId: string): Promise<Subscription[]> {
    return SubscriptionModel.find({ productId })
      .select({ _id: 0, userId: 1, productId: 1, createdAt: 1, updatedAt: 1 })
      .lean<Subscription[]>()
      .exec();
  }

  async create(userId: number, productId: string): Promise<Subscription> {
    try {
      const document = await SubscriptionModel.create({ userId, productId });
      return {
        userId: document.userId,
        productId: document.productId,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
      };
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new DuplicateSubscriptionError();
      throw error;
    }
  }

  async delete(userId: number, productId: string): Promise<boolean> {
    const result = await SubscriptionModel.deleteOne({
      userId,
      productId,
    }).exec();
    return result.deletedCount > 0;
  }
}
