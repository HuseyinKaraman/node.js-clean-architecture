import { NextFunction, Response } from "express";
import { ExpressRequestInterface } from "../interface/ExpressRequestInterface";
import { UnAuthorizedError } from "../errors/UnAuthorizedError";
import { ServiceFactory } from "../../application/factories/ServiceFactory";
import { UserModel } from "../../infrastructure/databases/mongoose/model/UserModel";

export const AuthMiddleware = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnAuthorizedError("Access Denied. No token provided.");
    }

    const token = authHeader.split(" ")[1];
    
    // Token servisini factory'den alıyoruz
    const tokenService = ServiceFactory.getTokenService();
    
    try {
      // Token'ı doğruluyoruz
      const decoded = await tokenService.verify(token);
      
      if (!decoded.id) {
        throw new UnAuthorizedError("Invalid token format.");
      }
      
      // UserDocument nesnesini doğrudan MongoDB'den alıyoruz
      const user = await UserModel.findById(decoded.id);
      
      if (!user) {
        throw new UnAuthorizedError("User not found.");
      }
      
      // UserDocument'i request'e ekliyoruz
      req.user = user;
      
      next();
    } catch (tokenError) {
      throw new UnAuthorizedError("Invalid or expired token.");
    }
  } catch (err) {
    next(err);
  }
};