import type { Subscription } from "./Subscription.js";

export interface ISubscriptionRepository {
  find(userId: number, productId: number): Promise<Subscription | null>;
  create(userId: number, productId: number): Promise<Subscription>;
  delete(userId: number, productId: number): Promise<boolean>;
}
