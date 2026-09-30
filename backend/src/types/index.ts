export type RoleName = "admin" | "operador" | "usuario";

export type ProductStatus = "DISPONIBLE" | "SIN_STOCK" | "DISCONTINUADO";

export type NotifierChannel = "inapp" | "console";

export type PermissionName =
  | "product:read"
  | "product:create"
  | "product:update"
  | "product:change-status"
  | "product:delete"
  | "subscription:create"
  | "subscription:delete"
  | "notification:read"
  | "user:read"
  | "user:assign-role";

export interface JwtPayload {
  userId: string;
  email: string;
  role: RoleName;
  permissions: PermissionName[];
}

export interface ProductStatusChangedEvent {
  productId: string;
  productName: string;
  oldStatus: ProductStatus;
  newStatus: ProductStatus;
  changedByUserId: string;
  occurredAt: Date;
}
