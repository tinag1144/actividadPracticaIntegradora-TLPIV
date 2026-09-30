import type { HydratedDocument } from "mongoose";
import type { IProduct } from "../../models/interfaces/product.interface.js";
import { Product as ProductModel } from "../../models/product.model.js";
import type { IProductRepository } from "./IProductRepository.js";
import type { Product, ProductInput, ProductUpdate } from "./Product.js";
import type { ProductStatus } from "../../types/index.js";

const toProduct = (document: HydratedDocument<IProduct>): Product => ({
  id: document.id,
  name: document.name,
  description: document.description,
  status: document.status,
  price: document.price,
  stock: document.stock,
  category: document.category,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

export class ProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    const documents = await ProductModel.find().exec();
    return documents.map(toProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const document = await ProductModel.findOne({ id }).exec();
    return document ? toProduct(document) : null;
  }

  async create(input: ProductInput): Promise<Product> {
    const document = await ProductModel.create(input);
    return toProduct(document);
  }

  async update(id: string, changes: ProductUpdate): Promise<Product | null> {
    const document = await ProductModel.findOneAndUpdate({ id }, changes, {
      new: true,
      runValidators: true,
    }).exec();
    return document ? toProduct(document) : null;
  }

  async updateStatus(
    id: string,
    status: ProductStatus,
  ): Promise<Product | null> {
    const document = await ProductModel.findOneAndUpdate(
      { id },
      { status },
      { new: true, runValidators: true },
    ).exec();
    return document ? toProduct(document) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ProductModel.deleteOne({ id }).exec();
    return result.deletedCount > 0;
  }
}
