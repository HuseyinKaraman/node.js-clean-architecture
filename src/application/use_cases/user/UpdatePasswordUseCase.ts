import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IHashService } from '../../../domain/interfaces/IHashService';
import { IEmailService } from '../../../domain/interfaces/IEmailService';

interface UpdatePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

interface UpdatePasswordResponse {
  success: boolean;
  message: string;
}

export class UpdatePasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private hashService: IHashService,
    private emailService: IEmailService
  ) {}

  async execute(request: UpdatePasswordRequest): Promise<UpdatePasswordResponse> {
    const { userId, currentPassword, newPassword } = request;
    
    // Kullanıcıyı buluyoruz
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return {
        success: false,
        message: 'Kullanıcı bulunamadı'
      };
    }
    
    // Mevcut şifreyi doğruluyoruz
    const isPasswordValid = await this.hashService.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Mevcut şifre yanlış'
      };
    }
    
    // Yeni şifreyi hash'liyoruz
    const hashedPassword = await this.hashService.hash(newPassword);
    
    // Şifreyi güncelliyoruz
    const updated = await this.userRepository.updatePassword(userId, hashedPassword);
    if (!updated) {
      return {
        success: false,
        message: 'Şifre güncellenemedi'
      };
    }
    
    // Kullanıcıya bilgilendirme e-postası gönderiyoruz
    await this.emailService.send({
      to: user.email,
      subject: 'Filayo - Şifreniz Değiştirildi',
      template: 'passwordChangedTemplate',
      context: {
        email: user.email,
        date: new Date().toLocaleString('tr-TR')
      }
    });
    
    return {
      success: true,
      message: 'Şifreniz başarıyla güncellendi'
    };
  }
}