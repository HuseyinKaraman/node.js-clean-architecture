import { IFileRepository } from "../../../domain/repositories/IFileRepository";

interface DeleteFileRequest {
  entityType: string;
  filename: string;
  userId?: string;
}

interface DeleteFileResponse {
  success: boolean;
  message?: string;
}

export class DeleteFileUseCase {
  constructor(private fileRepository: IFileRepository) {}

  async execute(request: DeleteFileRequest): Promise<DeleteFileResponse> {
    try {
      const { entityType, filename, userId } = request;

      if (!entityType || !filename) {
        return {
          success: false,
          message: "Entity türü ve dosya adı gereklidir",
        };
      }

      const result = await this.fileRepository.deleteFile(entityType, userId || "", filename);

      if (!result) {
        return {
          success: false,
          message: "Dosya silinemedi",
        };
      }

      return {
        success: true,
        message: "Dosya başarıyla silindi",
      };
    } catch (error) {
      return {
        success: false,
        message: `Dosya silinirken bir hata oluştu: ${
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu"
        }`,
      };
    }
  }
}
