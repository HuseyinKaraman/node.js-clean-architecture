import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IHashService } from '../../../domain/interfaces/IHashService';
import { ITokenService } from '../../../domain/interfaces/ITokenService';
import { UserRole } from '../../../domain/entities/User';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    company?: any;
    location?: any;
    emailVerified?: boolean;
  };
  accessToken?: string;
  message?: string;
}

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private tokenService: ITokenService
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const { email, password } = request;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return {
        success: false,
        message: 'Geçersiz e-posta adresi veya şifre'
      };
    }


    const isPasswordValid = await this.hashService.compare(password, user.password);    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Geçersiz e-posta adresi veya şifre'
      };
    }


    const accessToken = await this.tokenService.generate({
      id: user.id, 
      email: user.email, 
      role: user.role
    });

    await this.userRepository.updateLastLogin(user.id!.toString());

    return {
      success: true,
      user: {
        id: user.id!,
        email: user.email,
        role: user.role,
        company: user.company,
        location: user.location,
        emailVerified: user.emailVerified
      },
      accessToken
    };
  }
}