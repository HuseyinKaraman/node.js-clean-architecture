import { Request, Response, NextFunction } from "express";
import { Server } from "../../infrastructure/server/Server";
import { NotFoundError } from "../errors/NotFoundError";
import { UserUseCase } from "../../application/use-cases/userUseCase";
import { IUserUseCase } from "../../application/interface/IUserUseCase";
import { ExpressRequestInterface } from "../interface/ExpressRequestInterface";
import { UnAuthorizedError } from "../errors/UnAuthorizedError";

export class UserController {
  constructor(private userUseCase: IUserUseCase, private server: Server) {}

  async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>>> {
    const { username, email, password } = req.body;

    const { accessToken, refreshToken } = await this.userUseCase.createUser({
      username,
      email,
      password,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //this.server.emitEvent("userCreated", { username, email });

    return res.status(201).send({
      accessToken,
      refreshToken,
    });
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>> {
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await this.userUseCase.loginUser(
      email,
      password
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).send({
      accessToken,
      refreshToken,
    });
  }

  async refreshAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>>> {
    const { refreshToken } = req.body;
    const { accessToken } = await this.userUseCase.refreshAccessToken(
      refreshToken
    );

    return res.status(200).json({ accessToken });
  }

  async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>>> {
    const { refreshToken } = req.cookies || null;
    
    if (!refreshToken) {
      res.clearCookie("refreshToken");
      return res.status(200).json({ message: "logout successfully" });
    }
  
    const result = await this.userUseCase.logout(refreshToken);
  
    if (result) {
      res.clearCookie("refreshToken");
      return res.status(200).json({ message: "logout successfully" });
    } else {
      return res.status(200).json({ message: "logout successfully" });
    }
  }

  async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>>> {
    const user = await this.userUseCase.getUser(req.params.id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return res.status(200).json(user);
  }

  async currentUser(
    req: ExpressRequestInterface,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>>> {
    if (!req.user) {
      throw new UnAuthorizedError("Unauthorized Access");
    }
    return res.status(200).json({
      id: req.user._id,
      email: req.user.email,
      username: req.user.email,
    });
  }
}
