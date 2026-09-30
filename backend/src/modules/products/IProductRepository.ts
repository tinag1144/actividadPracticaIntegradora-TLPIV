import type { ProductStatus } from "../../types/index.js";
import type { Product, ProductInput, ProductUpdate } from "./Product.js";

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, changes: ProductUpdate): Promise<Product | null>;
  updateStatus(id: string, status: ProductStatus): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}
