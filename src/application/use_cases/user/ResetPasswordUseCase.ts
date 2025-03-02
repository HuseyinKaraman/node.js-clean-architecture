import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IHashService } from '../../../domain/interfaces/IHashService';
import { IEmailService } from '../../../domain/interfaces/IEmailService';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { TokenAction } from '../../../infrastructure/databases/mongoose/model/TokenModel';

interface ResetPasswordRequest {
  code: string;
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export class ResetPasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private emailService: IEmailService,
    private tokenRepository: ITokenRepository
  ) {}

  async execute(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const { code, newPassword } = request;
    
      // Token'ı doğruluyoruz
    const payload = await this.tokenRepository.verify(code, TokenAction.RESET_PASSWORD);
    if (!payload) {
      return {
        success: false,
        message: 'Geçersiz token'
      };
    }


    // Token'a göre kullanıcıyı buluyoruz
    const userDoc = await this.userRepository.findById(payload.userId.toString());
    if (!userDoc) {
      return {
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      };
    }
    
    // Yeni şifreyi hash'liyoruz
    const hashedPassword = await this.hashService.hash(newPassword);
    
    // Şifreyi güncelliyoruz
    const updated = await this.userRepository.updatePassword(userDoc.id!, hashedPassword);
    if (!updated) {
      return {
        success: false,
        message: 'Şifre güncellenemedi'
      };
    }
    
    // Token'ı geçersiz kılıyoruz
    await this.tokenRepository.invalidate(payload._id!.toString());

    // Kullanıcıya bilgilendirme e-postası gönderiyoruz
    await this.emailService.send({
      to: userDoc.email,
      subject: 'Filayo - Şifreniz Değiştirildi',
      template: 'passwordChangedTemplate',
      context: {
        email: userDoc.email,
        date: new Date().toLocaleString('tr-TR')
      }
    });
    
    return {
      success: true,
      message: 'Şifreniz başarıyla sıfırlandı'
    };
  }
}