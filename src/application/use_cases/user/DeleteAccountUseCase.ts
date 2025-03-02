import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { TokenAction } from '../../../infrastructure/databases/mongoose/model/TokenModel';

interface  DeleteAccountRequest {
  code: string;
  userId: string;
}

interface  DeleteAccountResponse {
  success: boolean;
  message: string;
}

export class DeleteAccountUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenRepository: ITokenRepository
  ) {}

  async execute(request:  DeleteAccountRequest): Promise< DeleteAccountResponse> {
    const { code, userId } = request;

    try {
      const token = await this.tokenRepository.findByCodeAndAction(TokenAction.DELETE_ACCOUNT, code);
      if (!token || !token._id) {
        return {
          success: false,
          message: 'Geçerli bir doğrulama kodu bulunamadı'
        };
      }
      
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'Kullanıcı bulunamadı'
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
      const result = await this.userRepository.deleteUser(user.id!);
      if (!result) {
        return {
          success: false,
          message: 'Kullanıcı silme işlemi başarısız'
        };
      }

      // Kullanılan token'ı geçersiz kılıyoruz
      await this.tokenRepository.invalidate(token._id.toString());

      return {
        success: true,
        message: 'Kullanıcı başarıyla silindi'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      };
    }
  }
}