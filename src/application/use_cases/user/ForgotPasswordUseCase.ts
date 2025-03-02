// src/application/use_cases/user/ForgotPasswordUseCase.ts
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEmailService } from '../../../domain/interfaces/IEmailService';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { TokenAction } from '../../../infrastructure/databases/mongoose/model/TokenModel';

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
    private tokenRepository: ITokenRepository
  ) {}

  async execute(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const { email } = request;
    
    // Kullanıcıyı e-posta adresine göre buluyoruz
    const userDoc = await this.userRepository.findByEmail(email)
    if (!userDoc) {
      // Güvenlik nedeniyle kullanıcı bulunamasa bile başarılı mesajı dönüyoruz
      return {
        success: true,
        message: 'Şifre sıfırlama talimatları e-posta adresinize gönderildi'
      };
    }
    
    const oldToken = await this.tokenRepository.findByUserIdAndAction(userDoc?.id!.toString(), TokenAction.RESET_PASSWORD);
    if (oldToken) {
      const now = new Date();
      const expiresAt = new Date(oldToken.expiresAt);
      if (expiresAt > now) {
        return {
          success: false,
          message: 'Eski Şifre Sıfırlama Kodu Geçerli. Lütfen bir Süre sonra tekrar deneyin.'
          };
      }

      await this.tokenRepository.invalidate(oldToken._id!.toString());
    }

   // Şifre sıfırlama kodu oluşturuyoruz
    const resetCode = await this.tokenRepository.generate({
      userId: userDoc.id,
      email: userDoc.email,
      action: TokenAction.RESET_PASSWORD,
    }, '30m');

    // Front-end URL'sini ortam değişkeninden alıyoruz
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Şifre sıfırlama e-postasını gönderiyoruz
    await this.emailService.send({
      to: email,
      subject: 'Filayo - Şifre Sıfırlama',
      template: 'passwordResetTemplate',
      context: {
        resetCode,
        frontendUrl, // TODO
      }
    });
    
    return {
      success: true,
      message: 'Şifre sıfırlama talimatları e-posta adresinize gönderildi'
    };
  }
}