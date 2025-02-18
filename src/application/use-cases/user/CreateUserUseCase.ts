import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ITokenService } from "../../../domain/interfaces/ITokenService";
import { UserBuilder } from "../../builder/UserBuilder";
import mongoose from "mongoose";

export class CreateUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly tokenService: ITokenService
    ) {}

    async execute(userData: {
        username: string;
        email: string;
        password: string;
    }): Promise<{ accessToken: string; refreshToken: string }> {
        const user = new UserBuilder()
            .setUsername(userData.username)
            .setEmail(userData.email)
            .setPassword(userData.password)
            .setCreatedAt(new Date())
            .build();

        const savedUser = await this.userRepository.create(user);
        
        const accessToken = await this.tokenService.generate({
            userId: new mongoose.Types.ObjectId(savedUser._id)
        });
        
        const refreshToken = await this.tokenService.generate({
            userId: new mongoose.Types.ObjectId(savedUser._id),
            isRefreshToken: true
        });

        savedUser.refreshToken = refreshToken;
        await savedUser.save();

        return { accessToken, refreshToken };
    }
}