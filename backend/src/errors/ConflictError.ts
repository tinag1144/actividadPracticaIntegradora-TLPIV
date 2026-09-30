export class ConflictError extends Error {
  readonly statusCode: number = 409;

  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
