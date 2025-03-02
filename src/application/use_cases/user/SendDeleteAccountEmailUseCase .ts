import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IEmailService } from '../../../domain/interfaces/IEmailService';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { TokenAction } from '../../../infrastructure/databases/mongoose/model/TokenModel';

interface SendDeleteAccountEmailRequest {
  id: string;
}

interface SendDeleteAccountEmailResponse {
  success: boolean;
  message?: string;
}

export class SendDeleteAccountEmailUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService,
    private tokenRepository: ITokenRepository
  ) {}

  async execute(request: SendDeleteAccountEmailRequest): Promise<SendDeleteAccountEmailResponse> {
    const { id } = request;
    
    // Kullanıcıyı buluyoruz
    const user = await this.userRepository.findById(id);
    if (!user) {
      return {
        success: false,
        message: 'Kullanıcı bulunamadı'
      };
    }

    // Eski doğrulama token'ını geçersiz kılıyoruz
    const oldToken = await this.tokenRepository.findByUserIdAndAction(id, TokenAction.DELETE_ACCOUNT);
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
    const deleteAccountCode = await this.tokenRepository.generate({
      userId: user.id,
      email: user.email,
      action: TokenAction.DELETE_ACCOUNT
    }, '10m'); // 10 dakika geçerli

    // Doğrulama e-postasını gönderiyoruz
    await this.emailService.send({
      to: user.email,
      subject: 'Filayo - Hesabını Silme Onay Kodu',
      template: 'deleteAccountCodeTemplate',
      context: {
        deleteAccountCode,
        email: user.email
      }
    });
    
    return {
      success: true,
      message: 'Hesabınızı silmek için e-posta adresinize gönderilen doğrulama kodunu girin'
    };
  }
}