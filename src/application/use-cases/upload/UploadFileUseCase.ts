import {
  UploadOptions,
  UploadResult,
} from "../../../domain/interfaces/IFileUploadService";
import { IFileRepository } from "../../../domain/repositories/IFileRepository";

interface UploadFileRequest {
  file: Express.Multer.File;
  entityType: string;
  fieldName: string;
  generateThumbnail?: boolean;
  acl?: string;
  userId?: string;
}

interface UploadFileResponse {
  success: boolean;
  fileData?: UploadResult;
  message?: string;
}

export class UploadFileUseCase {
  constructor(private fileRepository: IFileRepository) {}

  async execute(request: UploadFileRequest): Promise<UploadFileResponse> {
    try {
      const { file, entityType, fieldName, userId, generateThumbnail, acl } = request;

      if (!file) {
        return {
          success: false,
          message: "Dosya bulunamadı",
        };
      }

      const options: UploadOptions = {
        entityType,
        fieldName,
        userId,
        generateThumbnail,
        acl,
      };

      const fileData = await this.fileRepository.uploadFile(file, options);

      return {
        success: true,
        fileData,
      };
    } catch (error) {
      return {
        success: false,
        message: `Dosya yüklenirken bir hata oluştu: ${
          error instanceof Error ? error.message : "Bilinmeyen hata"
        }`,
      };
    }
  }
}
