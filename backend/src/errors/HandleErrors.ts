import { type Response } from "express";
import { HttpError } from "./HttpError.js";

// Translates domain errors into HTTP responses. Shared by controllers and the errorHandler middleware.
export function handleError(error: unknown, res: Response): void {
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
}
