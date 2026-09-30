export interface Subscription {
  userId: number;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DuplicateSubscriptionError extends Error {
  constructor() {
    super("Subscription already exists");
    this.name = "DuplicateSubscriptionError";
  }
}
