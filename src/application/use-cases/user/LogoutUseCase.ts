import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class LogoutUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(refreshToken: string): Promise<boolean> {
        const user = await this.userRepository.findByRefreshToken(refreshToken);
        if (!user) return false;

        user.refreshToken = '';
        await user.save();
        return true;
    }
}