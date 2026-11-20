export type RoleName = "admin" | "operador" | "usuario";

export const ROLE_NAMES: readonly RoleName[] = ["admin", "operador", "usuario"];

// Permissions follow the backend format "resource:action", e.g. "user:read".
export type Permission = string;

export interface AuthUser {
  id: string;
  email: string;
  role: RoleName;
  permissions: Permission[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface RegisteredUser {
  id: string;
  email: string;
  role: RoleName;
}

export interface Credentials {
  email: string;
  password: string;
}

export const PRODUCT_STATUSES = ["DISPONIBLE", "SIN_STOCK", "DISCONTINUADO"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DISPONIBLE: "Disponible",
  SIN_STOCK: "Sin stock",
  DISCONTINUADO: "Discontinuado",
};

export interface ProductFields {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface Product extends ProductFields {
  id: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  productId: string;
  productName: string;
  oldStatus: ProductStatus;
  newStatus: ProductStatus;
  message: string;
  read: boolean;
  createdAt: string;
}
