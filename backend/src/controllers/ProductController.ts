import type { Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import type { ProductUpdate } from "../modules/products/Product.js";
import type { ProductService } from "../modules/products/ProductService.js";
import type { ProductStatus } from "../types/index.js";

const readId = (req: Request): string => {
  const id = req.params.id;
  if (typeof id !== "string" || !id.trim()) throw new BadRequestError("Product id is required");
  return id;
};

const readBody = (body: unknown): Record<string, unknown> => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new BadRequestError("Expected a JSON object");
  }
  return body as Record<string, unknown>;
};

const readText = (value: unknown, field: string): string => {
  if (typeof value !== "string" || !value.trim()) throw new BadRequestError(`${field} is required`);
  return value.trim();
};

const readNumber = (value: unknown, field: "price" | "stock"): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || (field === "stock" && !Number.isSafeInteger(value))) {
    throw new BadRequestError(field === "stock" ? "stock must be a non-negative integer" : "price must be a non-negative number");
  }
  return value;
};

const readStatus = (value: unknown): ProductStatus => {
  if (value === "DISPONIBLE" || value === "SIN_STOCK" || value === "DISCONTINUADO") return value;
  throw new BadRequestError("status must be one of: DISPONIBLE, SIN_STOCK, DISCONTINUADO");
};

export class ProductController {
  constructor(private readonly service: ProductService) {}

  async list(_req: Request, res: Response): Promise<void> {
    res.json(await this.service.list());
  }

  async detail(req: Request, res: Response): Promise<void> {
    res.json(await this.service.getById(readId(req)));
  }

  async create(req: Request, res: Response): Promise<void> {
    const body = readBody(req.body);
    const product = await this.service.create({
      name: readText(body.name, "name"),
      description: readText(body.description, "description"),
      category: readText(body.category, "category"),
      price: readNumber(body.price, "price"),
      stock: readNumber(body.stock, "stock"),
      status: body.status === undefined ? "DISPONIBLE" : readStatus(body.status),
    });
    res.status(201).json(product);
  }

  async update(req: Request, res: Response): Promise<void> {
    const body = readBody(req.body);
    if ("status" in body || "id" in body) throw new BadRequestError("Cannot edit id or status here");

    const changes: ProductUpdate = {};
    for (const field of ["name", "description", "category"] as const) {
      if (field in body) changes[field] = readText(body[field], field);
    }
    for (const field of ["price", "stock"] as const) {
      if (field in body) changes[field] = readNumber(body[field], field);
    }
    if (!Object.keys(changes).length) throw new BadRequestError("Provide fields to update");
    res.json(await this.service.update(readId(req), changes));
  }

  async changeStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const { status } = readBody(req.body);
    res.json(await this.service.changeStatus(readId(req), readStatus(status), req.user.id));
  }

  async delete(req: Request, res: Response): Promise<void> {
    await this.service.delete(readId(req));
    res.sendStatus(204);
  }
}
