import { type IUserAccount } from "./IUserAccount.js";

// The authenticate middleware depends on this abstraction, not on AuthService directly.
export interface ITokenVerifier {
  verifyToken(token: string): Promise<IUserAccount>;
}
