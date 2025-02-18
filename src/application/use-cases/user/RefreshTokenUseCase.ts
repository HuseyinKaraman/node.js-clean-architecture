import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import { UnAuthorizedError } from "../../../interfaces/errors/UnAuthorizedError";
import mongoose from "mongoose";

export class RefreshTokenUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly tokenService: ITokenService
    ) {}

    async execute(refreshToken: string): Promise<{ accessToken: string }> {
        const user = await this.userRepository.findByRefreshToken(refreshToken);
        if (!user) {
            throw new UnAuthorizedError("Invalid refresh token");
        }

        const accessToken = await this.tokenService.generate({
            userId: new mongoose.Types.ObjectId(user._id)
        });

        return { accessToken };
    }
}