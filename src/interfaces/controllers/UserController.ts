import { Request, Response, NextFunction } from "express";
import { Server } from "../../infrastructure/server/Server";
import { NotFoundError } from "../errors/NotFoundError";
import { UnAuthorizedError } from "../errors/UnAuthorizedError";
import { ExpressRequestInterface } from "../interface/ExpressRequestInterface";
import { UserUseCaseFactory } from "../../application/factories/UserUseCaseFactory";

export class UserController {
    private useCases: ReturnType<typeof UserUseCaseFactory.create>;
    
    constructor(private server: Server) {
        this.useCases = UserUseCaseFactory.create();
    }

    async createUser(req: Request, res: Response, next: NextFunction) {
        const { username, email, password } = req.body;

        const { accessToken, refreshToken } = await this.useCases.createUser.execute({
            username,
            email,
            password,
        });

        this.setRefreshTokenCookie(res, refreshToken);

        return res.status(201).json({
            accessToken,
            refreshToken,
        });
    }

    async login(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        const { accessToken, refreshToken } = await this.useCases.loginUser.execute(
            email,
            password
        );

        this.setRefreshTokenCookie(res, refreshToken);
        
        return res.status(200).json({
            accessToken,
            refreshToken,
        });
    }

    async refreshAccessToken(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.body;
        const { accessToken } = await this.useCases.refreshToken.execute(refreshToken);

        return res.status(200).json({ accessToken });
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.cookies || null;
        
        if (!refreshToken) {
            res.clearCookie("refreshToken");
            return res.status(200).json({ message: "logout successfully" });
        }
    
        const result = await this.useCases.logout.execute(refreshToken);
    
        if (result) {
            res.clearCookie("refreshToken");
        }
        
        return res.status(200).json({ message: "logout successfully" });
    }

    async getUser(req: Request, res: Response, next: NextFunction) {
        const user = await this.useCases.getUser.execute(req.params.id);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        return res.status(200).json(user);
    }

    async currentUser(req: ExpressRequestInterface, res: Response, next: NextFunction) {
        if (!req.user) {
            throw new UnAuthorizedError("Unauthorized Access");
        }

        return res.status(200).json({
            id: req.user._id,
            email: req.user.email,
            username: req.user.email,
        });
    }

    private setRefreshTokenCookie(res: Response, refreshToken: string) {
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
    }
}