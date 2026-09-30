import { ConflictError } from "./ConflictError.js";
import { UnauthorizedError } from "./UnauthorizedError.js";
import { type Response } from "express";

export function handleError(error: unknown, res: Response): void {
    if (error instanceof ConflictError || error instanceof UnauthorizedError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
