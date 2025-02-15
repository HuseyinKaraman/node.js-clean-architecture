import { NextFunction, Response,Request } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../../infrastructure/databases/mongoose/model/UserModel";
import { ExpressRequestInterface } from "../interface/ExpressRequestInterface";
import { UnAuthorizedError } from "../errors/UnAuthorizedError";
import { verifyAccessToken } from '../utils/jwtUtils';


export const AuthMiddleware = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new UnAuthorizedError("Access Denied. No token provided.")
    }
    const token = authHeader.split(" ")[1];
    const data = verifyAccessToken(token) as { userId: string;};
    const user = await UserModel.findById(data.userId);

    if (!user) {
      throw new UnAuthorizedError("Invalid Token.")
    }

    req.user = user;
    next();
  } catch (err) {
    throw new UnAuthorizedError("Invalid Token.")
  }
};
