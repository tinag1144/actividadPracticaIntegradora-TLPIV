import { apiFetch } from "./client";
import type { Product, ProductFields, ProductStatus } from "../types";

const productPath = (id: string) => `/products/${encodeURIComponent(id)}`;

export const productsApi = {
  list: (): Promise<Product[]> => apiFetch("/products"),
  detail: (id: string): Promise<Product> => apiFetch(productPath(id)),
  create: (input: ProductFields & { status: ProductStatus }): Promise<Product> =>
    apiFetch("/products", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: ProductFields): Promise<Product> =>
    apiFetch(productPath(id), { method: "PATCH", body: JSON.stringify(input) }),
  changeStatus: (id: string, status: ProductStatus): Promise<Product> =>
    apiFetch(`${productPath(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  delete: (id: string): Promise<void> => apiFetch(productPath(id), { method: "DELETE" }),
  subscription: (id: string): Promise<{ subscribed: boolean }> =>
    apiFetch(`${productPath(id)}/subscription`),
  subscribe: (id: string): Promise<{ subscribed: boolean }> =>
    apiFetch(`${productPath(id)}/subscription`, { method: "POST" }),
  unsubscribe: (id: string): Promise<void> =>
    apiFetch(`${productPath(id)}/subscription`, { method: "DELETE" }),
};
