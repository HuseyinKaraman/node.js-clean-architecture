import { UploadOptions, UploadResult } from '../interfaces/IFileUploadService';

export interface IFileRepository {
  uploadFile(file: Express.Multer.File, options: UploadOptions): Promise<UploadResult>;
  getFileUrl(entityType: string, userId: string, filename: string): Promise<string>;
  deleteFile(entityType: string, userId: string, filename: string): Promise<boolean>;
  createUploadMiddleware(options: UploadOptions): any; // Multer middleware
  getUploadConfig(fieldType: string): UploadOptions; // Önceden tanımlanmış konfigürasyonları al
}
