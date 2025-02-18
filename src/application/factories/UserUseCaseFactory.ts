import { JwtService } from "../../infrastructure/services/JwtService";
import { BcryptService } from "../../infrastructure/services/BcryptService";
import { CreateUserUseCase } from "../use-cases/user/CreateUserUseCase";
import { LoginUserUseCase } from "../use-cases/user/LoginUserUseCase";
import { GetUserUseCase } from "../use-cases/user/GetUserUseCase";
import { RefreshTokenUseCase } from "../use-cases/user/RefreshTokenUseCase";
import { LogoutUseCase } from "../use-cases/user/LogoutUseCase";
import { RepositoryFactory } from "./RepositoryFactory";

export class UserUseCaseFactory {
    static create() {
        const userRepository = RepositoryFactory.createUserRepository();
        const tokenService = new JwtService();
        const hashService = new BcryptService();

        return {
            createUser: new CreateUserUseCase(userRepository, tokenService),
            loginUser: new LoginUserUseCase(userRepository, tokenService, hashService),
            getUser: new GetUserUseCase(userRepository),
            refreshToken: new RefreshTokenUseCase(userRepository, tokenService),
            logout: new LogoutUseCase(userRepository)
        };
    }
}