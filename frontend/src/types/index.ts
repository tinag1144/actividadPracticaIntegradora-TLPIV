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
