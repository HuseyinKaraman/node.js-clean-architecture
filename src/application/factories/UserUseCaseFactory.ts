import { LoginUseCase } from '../use_cases/user/LoginUserUseCase';
import { SignupUseCase } from '../use_cases/user/SignupUseCase';
import { GetUserUseCase } from '../use_cases/user/GetUserUseCase';
import { GetUsersUseCase } from '../use_cases/user/GetUsersUseCase';
import { UpdateUserUseCase } from '../use_cases/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '../use_cases/user/DeleteUserUseCase';
import { VerifyEmailUseCase } from '../use_cases/user/VerifyEmailUseCase';
import { UpdatePasswordUseCase } from '../use_cases/user/UpdatePasswordUseCase';
import { SendVerificationEmailUseCase } from '../use_cases/user/SendVerificationEmailUseCase';
import { ForgotPasswordUseCase } from '../use_cases/user/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '../use_cases/user/ResetPasswordUseCase';
import { DatabaseFactory } from './DatabaseFactory';
import { ServiceFactory } from './ServiceFactory';
import { SendDeleteAccountEmailUseCase } from '../use_cases/user/SendDeleteAccountEmailUseCase ';
import { DeleteAccountUseCase } from '../use_cases/user/DeleteAccountUseCase';

export class UserUseCaseFactory {
  static create() {
    const userRepository = DatabaseFactory.getUserRepository();
    const hashService = ServiceFactory.getHashService();
    const tokenService = ServiceFactory.getTokenService();
    const tokenRepository = DatabaseFactory.getTokenRepository()
    const emailService = ServiceFactory.getEmailService()

    return {
      // Mevcut use case'ler
      loginUser: new LoginUseCase(userRepository, hashService, tokenService),
      createUser: new SignupUseCase(userRepository, hashService),
      getUser: new GetUserUseCase(userRepository),
      
      // Yeni eklenen use case'ler
      getUsers: new GetUsersUseCase(userRepository),
      updateUser: new UpdateUserUseCase(userRepository),
      deleteUser: new DeleteUserUseCase(userRepository),
      deleteAccount: new DeleteAccountUseCase(userRepository, tokenRepository),
      updatePassword: new UpdatePasswordUseCase(userRepository, hashService, emailService),
      sendVerificationEmail: new SendVerificationEmailUseCase(userRepository, emailService, tokenRepository),
      sendDeleteAccountEmail: new SendDeleteAccountEmailUseCase(userRepository, emailService, tokenRepository),
      verifyEmail: new VerifyEmailUseCase(userRepository, tokenRepository),
      forgotPassword: new ForgotPasswordUseCase(userRepository, emailService, tokenRepository),
      resetPassword: new ResetPasswordUseCase(userRepository, hashService, emailService, tokenRepository),
    };
  }
}