import { Request, Response, NextFunction } from "express";
import { UploadUseCaseFactory } from "../../application/factories/UploadUseCaseFactory";
import { BadRequestError } from "../errors/BadRequestError";

export class UploadController {
  private useCases: ReturnType<typeof UploadUseCaseFactory.create>;

  constructor() {
    this.useCases = UploadUseCaseFactory.create();
  }

  async handleUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { fieldType, entityType, generateThumbnail } = req.body;
      const userId = req.body.userId || (req as any).user?.id;

      if (req.files && Array.isArray(req.files)) {
        if ((req as any).s3Keys && (req as any).s3Filenames) {
          req.files.forEach((file, index) => {
            (file as any).key = (req as any).s3Keys[index];
            file.filename = (req as any).s3Filenames[index];
          });
        }

        const result = await this.useCases.uploadFile.execute({
          files: req.files,
          entityType,
          fieldName: fieldType,
          generateThumbnail,
          userId,
        });

        if (!result.success) {
          throw new BadRequestError(result.message || "Dosyalar yüklenemedi");
        }

        res.status(200).json({
          success: true,
          filesData: result.fileData,
        });
      } else if (req.file) {
        if ((req as any).s3Keys && (req as any).s3Keys.length > 0) {
          (req.file as any).key = (req as any).s3Keys[0];
        }

        if ((req as any).s3Filenames && (req as any).s3Filenames.length > 0) {
          req.file.filename = (req as any).s3Filenames[0];
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
      } else {
        throw new BadRequestError("Dosya yüklenemedi. Dosya bulunamadı.");
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { entityType, filename } = req.params;
      const userId = (req as any).user?.id || "";

      const result = await this.useCases.deleteFile.execute({
        entityType,
        filename,
        userId,
      });

      if (!result.success) {
        throw new BadRequestError(result.message || "Dosya silinemedi");
      }

      return res.status(200).json({
        success: true,
        message: result.message || "Dosya başarıyla silindi",
      });
    } catch (error) {
      next(error);
    }
  }
}
