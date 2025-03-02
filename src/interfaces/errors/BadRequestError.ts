import { CustomError } from './CustomError';

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public message: string, public errors?: any[]) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
