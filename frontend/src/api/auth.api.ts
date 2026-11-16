import { apiFetch } from "./client";
import type { AuthUser, Credentials, LoginResponse, RegisteredUser } from "../types";

export const authApi = {
  login: (credentials: Credentials): Promise<LoginResponse> =>
    apiFetch<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),

  register: (credentials: Credentials): Promise<RegisteredUser> =>
    apiFetch<RegisteredUser>("/auth/register", { method: "POST", body: JSON.stringify(credentials) }),

  me: (): Promise<AuthUser> => apiFetch<AuthUser>("/auth/me"),
};
