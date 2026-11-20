import { type IUserAccount } from "../services/interfaces/IUserAccount.js";

declare global {
  namespace Express {
    interface Request {
      // Set by the authenticate middleware.
      user?: IUserAccount;
    }
  }
}

export {};
