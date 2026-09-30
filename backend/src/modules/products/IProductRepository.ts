import type { ProductStatus } from "../../types/index.js";
import type { Product, ProductInput, ProductUpdate } from "./Product.js";

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  create(input: ProductInput): Promise<Product>;
  update(id: number, changes: ProductUpdate): Promise<Product | null>;
  updateStatus(id: number, status: ProductStatus): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
}
