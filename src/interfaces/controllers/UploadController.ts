import { Request, Response, NextFunction } from "express";
import { UploadUseCaseFactory } from '../../application/factories/UploadUseCaseFactory';
import { BadRequestError } from "../errors/BadRequestError";

export class UploadController {
  private useCases: ReturnType<typeof UploadUseCaseFactory.create>;

  constructor() {
    this.useCases = UploadUseCaseFactory.create();
  }

  async handleUpload(req: Request, res: Response, next: NextFunction) {
    try {
      // Dosya varlığını kontrol et
      if (!req.file) {
        throw new BadRequestError('Dosya yüklenemedi');
      }

      const { fieldType, entityType, generateThumbnail } = req.body;
      const userId = req.body.userId || (req as any).user?.id;

      // S3 key ve filename'i alıp req.file'a ekle (middleware'den geliyor)
      if (req.s3Key) {
        (req.file as any).key = req.s3Key;
      }

      if (req.s3Filename) {
        req.file.filename = req.s3Filename;
      }

      const result = await this.useCases.uploadFile.execute({
        file: req.file,
        entityType,
        fieldName: fieldType,
        generateThumbnail,
        userId,
      });

      if (!result.success) {
        throw new BadRequestError(result.message || "Dosya yüklenemedi");
      }

      res.status(200).json({
        success: true,
        fileData: result.fileData,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, filename } = req.params;

      const result = await this.useCases.deleteFile.execute({
        entityType,
        filename
      });

      if (!result.success) {
        throw new BadRequestError(result.message || 'Dosya silinemedi');
      }

      return res.status(200).json({
        success: true,
        message: result.message || 'Dosya başarıyla silindi'
      });
    } catch (error) {
      next(error);
    }
  }
}
