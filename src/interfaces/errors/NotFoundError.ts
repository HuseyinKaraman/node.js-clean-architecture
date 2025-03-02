import { CustomError } from './CustomError';

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(
    public message: string = 'Kayıt bulunamadı',
    public errors?: any[]
  ) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}