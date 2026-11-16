const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const TOKEN_KEY = "token";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// Called when the backend rejects the token (401). AuthContext registers the logout here.
let unauthorizedHandler: (() => void) | null = null;

export const onUnauthorized = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler;
};

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string") {
      return body.message;
    }
  } catch {
    // The body was not JSON: fall through to the status text.
  }
  return response.statusText || "Request failed";
};

// Base fetch wrapper: adds the JWT, sends/parses JSON and turns HTTP errors into ApiError.
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = tokenStorage.get();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, "Could not reach the server");
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      unauthorizedHandler?.();
    }
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
