import {
  UploadOptions,
  UploadResult,
} from "../../../domain/interfaces/IFileUploadService";
import { IFileRepository } from "../../../domain/repositories/IFileRepository";

interface UploadFileRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
  entityType: string;
  fieldName: string;
  generateThumbnail?: boolean;
  acl?: string;
  userId?: string;
}

interface UploadFileResponse {
  success: boolean;
  fileData?: UploadResult | UploadResult[];
  message?: string;
}

export class UploadFileUseCase {
  constructor(private fileRepository: IFileRepository) {}

  async execute(request: UploadFileRequest): Promise<UploadFileResponse> {
    try {
      const { file, files, entityType, fieldName, userId, generateThumbnail, acl } = request;

      // Tek dosya veya çoklu dosya kontrolü
      if (!file && (!files || files.length === 0)) {
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

      let fileData: UploadResult | UploadResult[];

      // Çoklu dosya yükleme
      if (files && files.length > 0) {
        fileData = await this.fileRepository.uploadMultipleFiles(files, options);
      } 
      // Tek dosya yükleme
      else if (file) {
        fileData = await this.fileRepository.uploadFile(file, options);
      } 
      // Bu duruma hiç düşmemesi gerekir ama tip güvenliği için ekledik
      else{
        return {
          success: false,
          message: "Dosya bulunamadı",
        };
      }

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
