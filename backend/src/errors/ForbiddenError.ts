import { HttpError } from "./HttpError.js";

export class ForbiddenError extends HttpError {
  constructor(message: string) {
    super(403, message);
    this.name = "ForbiddenError";
  }
}
