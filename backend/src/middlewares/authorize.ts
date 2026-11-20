import { type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { ForbiddenError } from "../errors/ForbiddenError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

// Must run after authenticate. Responds 403 unless the user has every required permission.
export const authorize =
  (...requiredPermissions: string[]): RequestHandler =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const granted = new Set(req.user.permissions);
    const missing = requiredPermissions.filter((permission) => !granted.has(permission));

    if (missing.length > 0) {
      throw new ForbiddenError(`Missing permission: ${missing.join(", ")}`);
    }

    next();
  };
