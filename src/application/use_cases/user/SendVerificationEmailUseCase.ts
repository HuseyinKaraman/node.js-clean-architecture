import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEmailService } from '../../../domain/interfaces/IEmailService';
import { ITokenService } from '../../../domain/interfaces/ITokenService';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { TokenAction } from '../../../infrastructure/databases/mongoose/model/TokenModel';

interface SendVerificationEmailRequest {
  email: string;
}

interface SendVerificationEmailResponse {
  success: boolean;
  message?: string;
}

export class SendVerificationEmailUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
    private tokenRepository: ITokenRepository
  ) {}

  async execute(request: SendVerificationEmailRequest): Promise<SendVerificationEmailResponse> {
    const { email } = request;
    
    // Kullanıcıyı buluyoruz
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return {
        success: false,
        message: 'Kullanıcı bulunamadı'
      };
    }
    
    // Zaten doğrulanmış mı kontrol ediyoruz
    if (user.emailVerified) {
      return {
        success: false,
        message: 'E-posta adresi zaten doğrulanmış'
      };
    }

    // Eski doğrulama token'ını geçersiz kılıyoruz
    const oldToken = await this.tokenRepository.findByUserIdAndAction(user.id!, TokenAction.EMAIL_VERIFICATION);
    if (oldToken && oldToken._id) {
      const now = new Date();
      if (oldToken.expiresAt > now) {
        return {
          success: false,
          message: 'Eski doğrulama kodu geçerli. Lütfen bir süre sonra tekrar deneyin.'
        };
      }

      await this.tokenRepository.invalidate(oldToken._id.toString());
    }
  

    // Doğrulama kodunu oluşturuyoruz
    const verificationCode = await this.tokenRepository.generate({
      userId: user.id,
      email: user.email,
      action: TokenAction.EMAIL_VERIFICATION
    }, '10m'); // 10 dakika geçerli

    // Doğrulama e-postasını gönderiyoruz
    await this.emailService.send({
      to: user.email,
      subject: 'Filayo - E-posta Doğrulama',
      template: 'verificationCodeTemplate',
      context: {
        verificationCode,
        email: user.email
      }
    });
    
    return {
      success: true,
      message: 'Doğrulama e-postası gönderildi'
    };
  }
}