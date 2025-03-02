import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { TokenAction } from '../../../infrastructure/databases/mongoose/model/TokenModel';

interface VerifyEmailRequest {
  code: string;
}

interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export class VerifyEmailUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: ITokenRepository
  ) {}

  async execute(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const { code } = request;

    try {
      
      const token = await this.tokenRepository.findByCodeAndAction(TokenAction.EMAIL_VERIFICATION, code);
      if (!token || !token._id) {
        return {
          success: false,
          message: 'Geçerli bir doğrulama kodu bulunamadı'
        };
      }
      
      const user = await this.userRepository.findById(token.userId.toString());
      if (!user) {
        return {
          success: false,
          message: 'Kullanıcı bulunamadı'
        };
      }

      if (user.emailVerified) {
        return {
          success: true,
          message: 'E-posta adresi zaten doğrulanmış'
        };
      }

      // Token'ın süresi dolmuş mu kontrol ediyoruz
      if (new Date() > token.expiresAt) {
        return {
          success: false,
          message: 'Doğrulama kodunun süresi dolmuş'
        };
      }

      // E-posta doğrulama
      const verified = await this.userRepository.verifyEmail(user.id!);
      if (!verified) {
        return {
          success: false,
          message: 'E-posta doğrulama başarısız oldu'
        };
      }

      // Kullanılan token'ı geçersiz kılıyoruz
      await this.tokenRepository.invalidate(token._id.toString());

      return {
        success: true,
        message: 'E-posta adresiniz başarıyla doğrulandı'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      };
    }
  }
}