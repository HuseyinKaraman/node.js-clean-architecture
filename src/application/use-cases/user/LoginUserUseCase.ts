import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import { IHashService } from "../../../domain/interfaces/IHashService";
import { NotFoundError } from "../../../interfaces/errors/NotFoundError";
import { BadRequestError } from "../../../interfaces/errors/BadRequestError";
import mongoose from "mongoose";

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly tokenService: ITokenService,
        private readonly hashService: IHashService
    ) {}

    async execute(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new NotFoundError("User not found");
        }

        const isValidPassword = await this.hashService.compare(password, user.password);
        if (!isValidPassword) {
            throw new BadRequestError("Incorrect email or password");
        }

        const accessToken = await this.tokenService.generate({
            userId: new mongoose.Types.ObjectId(user._id)
        });
        
        const refreshToken = await this.tokenService.generate({
            userId: new mongoose.Types.ObjectId(user._id),
            isRefreshToken: true
        });

        user.refreshToken = refreshToken;
        await user.save();

        return { accessToken, refreshToken };
    }
}