import { HttpError } from "./HttpError.js";

export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}
