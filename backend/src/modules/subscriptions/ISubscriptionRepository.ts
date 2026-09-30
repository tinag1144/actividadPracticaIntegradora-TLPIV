import type { Subscription } from "./Subscription.js";

export interface ISubscriptionRepository {
  find(userId: number, productId: string): Promise<Subscription | null>;
  findByProductId(productId: string): Promise<Subscription[]>;
  create(userId: number, productId: string): Promise<Subscription>;
  delete(userId: number, productId: string): Promise<boolean>;
}
