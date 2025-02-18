import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";

export class GetUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string): Promise<User | null> {
        return this.userRepository.findById(userId);
    }
}