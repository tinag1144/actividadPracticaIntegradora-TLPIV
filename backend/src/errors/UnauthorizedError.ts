export class UnauthorizedError extends Error {
  readonly statusCode: number = 401;

  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
