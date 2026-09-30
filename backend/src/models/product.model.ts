import { Schema, model } from "mongoose";
import type { IProduct } from "./interfaces/product.interface.js";

export const ProductSchema = new Schema<IProduct>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["DISPONIBLE", "SIN_STOCK", "DISCONTINUADO"],
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
  },
  { timestamps: true, id: false },
);

export const Product = model<IProduct>("Product", ProductSchema);
