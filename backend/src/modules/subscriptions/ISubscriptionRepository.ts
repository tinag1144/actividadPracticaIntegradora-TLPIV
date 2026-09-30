import type { Subscription } from "./Subscription.js";

export interface ISubscriptionRepository {
  find(userId: number, productId: number): Promise<Subscription | null>;
  findByProductId(productId: number): Promise<Subscription[]>;
  create(userId: number, productId: number): Promise<Subscription>;
  delete(userId: number, productId: number): Promise<boolean>;
}
