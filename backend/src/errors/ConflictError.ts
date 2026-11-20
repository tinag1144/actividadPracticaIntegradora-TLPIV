import { HttpError } from "./HttpError.js";

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
    this.name = "ConflictError";
  }
}
