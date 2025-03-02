import { CustomError } from "./CustomError";

export class UnAuthorizedError extends CustomError {
  statusCode = 401;

  constructor(
    public message: string = "Yetkisiz erişim", 
    public errors?: any[]
  ) {
    super(message);
    Object.setPrototypeOf(this, UnAuthorizedError.prototype);
  }
}
