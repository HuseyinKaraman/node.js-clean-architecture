import { Request } from "express";
import { UserDocument } from "../../infrastructure/databases/mongoose/model/UserModel";

export interface ExpressRequestInterface extends Request {
  user?: UserDocument;
}
