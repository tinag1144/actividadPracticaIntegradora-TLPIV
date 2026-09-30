import type { ProductStatus } from "../../types/index.js";

export interface Product {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductInput = Omit<Product, "createdAt" | "updatedAt">;

export type ProductUpdate = Partial<Omit<ProductInput, "id" | "status">>;
