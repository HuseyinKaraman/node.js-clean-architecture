import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';

interface UpdateUserResponse {
  success: boolean;
  user: User | null;
  message?: string;
}

export class UpdateUserUseCase {
  constructor(
    private userRepository: IUserRepository,
  ) {}

  async execute(id: string, updateData: Partial<User>): Promise<UpdateUserResponse> {
    try {
      // Kullanıcının var olduğunu kontrol ediyoruz
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        return { 
          success: false, 
          user: null,
          message: 'Kullanıcı bulunamadı'
        };
      }
      
      // Şifre güncellenmesini engelliyoruz
      if (updateData.password) {
        delete updateData.password;
      }
      
      // Kullanıcıyı güncelliyoruz
      const updatedUser = await this.userRepository.updateUser(id, updateData);
      if (!updatedUser) {
        return { 
          success: false, 
          user: null,
          message: 'Kullanıcı güncellenemedi'
        };
      }

      return {
        success: true,
        user: updatedUser,
        message: 'Kullanıcı başarıyla güncellendi'
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        message: error instanceof Error ? error.message : 'Kullanıcı güncellenirken bir hata oluştu'
      };
    }
  }
}