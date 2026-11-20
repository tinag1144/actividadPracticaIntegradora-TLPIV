import { randomUUID } from "node:crypto";
import { NotFoundError } from "../../errors/NotFoundError.js";
import type { ISubject } from "../../observer/ISubject.js";
import type { ProductStatus, ProductStatusChangedEvent } from "../../types/index.js";
import type { IProductRepository } from "./IProductRepository.js";
import type { Product, ProductInput, ProductUpdate } from "./Product.js";

export class ProductService {
  private readonly statusChanges = new Map<string, Promise<Product>>();

  constructor(
    private readonly repository: IProductRepository,
    private readonly eventPublisher: ISubject<ProductStatusChangedEvent>,
  ) {}

  list(): Promise<Product[]> {
    return this.repository.findAll();
  }

  async getById(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  create(input: Omit<ProductInput, "id">): Promise<Product> {
    return this.repository.create({ ...input, id: randomUUID() });
  }

  async update(id: string, changes: ProductUpdate): Promise<Product> {
    const product = await this.repository.update(id, changes);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  async delete(id: string): Promise<void> {
    if (!(await this.repository.delete(id))) throw new NotFoundError("Product not found");
  }

  async changeStatus(id: string, newStatus: ProductStatus, userId: string): Promise<Product> {
    // A second change for this product must read the state persisted by the first one.
    const previousChange = this.statusChanges.get(id);
    const ready = previousChange?.catch(() => undefined) ?? Promise.resolve();
    const change = ready.then(() => this.persistStatusChange(id, newStatus, userId));
    this.statusChanges.set(id, change);

    try {
      return await change;
    } finally {
      if (this.statusChanges.get(id) === change) this.statusChanges.delete(id);
    }
  }

  private async persistStatusChange(id: string, newStatus: ProductStatus, userId: string): Promise<Product> {
    const previous = await this.getById(id);
    const oldStatus = previous.status;
    if (oldStatus === newStatus) return previous;

    const product = await this.repository.updateStatus(id, newStatus);
    if (!product) throw new NotFoundError("Product not found");

    const event: ProductStatusChangedEvent = {
      productId: product.id,
      productName: product.name,
      oldStatus,
      newStatus,
      changedByUserId: userId,
      occurredAt: product.updatedAt,
    };
    await this.eventPublisher.notify(event);
    return product;
  }
}
