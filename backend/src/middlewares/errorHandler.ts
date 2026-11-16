import { type ErrorRequestHandler, type RequestHandler } from "express";
import { handleError } from "../errors/HandleErrors.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";

const isJsonSyntaxError = (error: unknown): boolean =>
  error instanceof SyntaxError && "type" in error && error.type === "entity.parse.failed";

// Catches unknown routes and turns them into a JSON 404.
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Last middleware in the chain. Express 5 forwards rejected async handlers here automatically.
export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (isJsonSyntaxError(error)) {
    handleError(new BadRequestError("Malformed JSON body"), res);
    return;
  }

  handleError(error, res);
};
