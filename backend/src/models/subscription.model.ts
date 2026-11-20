import { Schema, model } from "mongoose";
import type { Subscription } from "../modules/subscriptions/Subscription.js";

const SubscriptionSchema = new Schema<Subscription>(
  {
    userId: { type: String, required: true },
    productId: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

SubscriptionSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const SubscriptionModel = model<Subscription>(
  "Subscription",
  SubscriptionSchema,
);
