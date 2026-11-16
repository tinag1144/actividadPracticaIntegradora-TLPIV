import { type NextFunction, type Request, type RequestHandler, type Response } from "express";
import { type ITokenVerifier } from "../services/interfaces/ITokenVerifier.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

const BEARER_PREFIX = "Bearer ";

// Reads "Authorization: Bearer <token>", validates it and attaches the user to req.user.
export const createAuthenticate =
  (tokenVerifier: ITokenVerifier): RequestHandler =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;

    if (!header?.startsWith(BEARER_PREFIX)) {
      throw new UnauthorizedError("Authentication required");
    }

    const token = header.slice(BEARER_PREFIX.length).trim();
    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    req.user = await tokenVerifier.verifyToken(token);
    next();
  };
