import type { Subscription } from "./Subscription.js";

export interface ISubscriptionRepository {
  find(userId: string, productId: string): Promise<Subscription | null>;
  findByProductId(productId: string): Promise<Subscription[]>;
  create(userId: string, productId: string): Promise<Subscription>;
  delete(userId: string, productId: string): Promise<boolean>;
}
