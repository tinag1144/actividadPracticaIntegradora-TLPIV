import { apiFetch } from "./client";
import type { AuthUser, RoleName } from "../types";

export const usersApi = {
  list: (): Promise<AuthUser[]> => apiFetch<AuthUser[]>("/users"),

  assignRole: (userId: string, role: RoleName): Promise<AuthUser> =>
    apiFetch<AuthUser>(`/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
};
