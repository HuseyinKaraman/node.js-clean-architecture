export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract errors?: any[];

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}
