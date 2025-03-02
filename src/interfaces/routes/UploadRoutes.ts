import { NextFunction, Request, Response, Router } from "express";
import { UploadController } from "../controllers/UploadController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { constants } from "../../constants";
import { IRouter } from "../interface/IRouter";
import { DatabaseFactory } from "../../application/factories/DatabaseFactory";

export class UploadRoutes implements IRouter {
  public router: Router;
  public path = constants.API_PREFIX! + "/upload";
  private fileRepository: any;
  private middlewareCache: Map<string, any> = new Map(); // middleware'leri cachelemek için

  constructor(private uploadController: UploadController) {
    this.router = Router();
    this.fileRepository = DatabaseFactory.getFileRepository();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/multiple/:fieldType/:entityType',
      [AuthMiddleware],
      this.createMultipleUploadMiddleware,
      this.uploadController.handleUpload.bind(this.uploadController)
    );

    // Genel dosya yükleme endpoint'i - her türlü dosya için
    this.router.post(
      '/:fieldType/:entityType',
      [AuthMiddleware], // Temel auth kontrolü
      this.createUploadMiddleware,
      this.uploadController.handleUpload.bind(this.uploadController)
    );

    // Dosya silme endpoint'i
    this.router.delete(
      '/:entityType/:filename',
      [AuthMiddleware],
      this.uploadController.deleteFile.bind(this.uploadController)
    );
  }

  private getUploadMiddleware(fieldType: string, userId: string): any {
    // Eğer bu fieldType için önceden oluşturulmuş bir middleware varsa onu kullan
    if (this.middlewareCache.has(fieldType)) {
      return this.middlewareCache.get(fieldType);
    }
    
    // Yoksa yeni bir middleware oluştur ve önbelleğe al
    const config = this.fileRepository.getUploadConfig(fieldType);
    const middleware = this.fileRepository.createUploadMiddleware({
      ...config,
      userId,
      fieldName: fieldType,
      acl: 'public-read'
    });
    
    this.middlewareCache.set(fieldType, middleware);
    return middleware;
  }

  private createUploadMiddleware = (req:Request, res:Response, next:NextFunction) => {
    const { fieldType, entityType } = req.params;
    
    if (!fieldType || !entityType) {
      return res.status(400).json({
        success: false, 
        message: 'fieldType ve entityType parametreleri gereklidir'
      });
    }
    
    // Kullanıcı ID'sini auth middleware'den al
    const userId = (req as any).user?.id;

    // Field tipine göre önbelleklenmiş middleware'i al
    const upload = this.getUploadMiddleware(fieldType, userId);
    
    // entityType ve userId'yi request nesnesine ekle
    (req as any).entityType = entityType;
    (req as any).userId = userId;

    // Multer'ı çalıştır
    upload(req, res, (err:Error) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // S3 key ve filename'i req.body'ye ekle (controller'da kullanılacak)
      req.body.fieldType = fieldType;
      req.body.entityType = entityType;
      req.body.userId = userId;
      req.body.generateThumbnail = this.fileRepository.getUploadConfig(fieldType).generateThumbnail;
      
      next();
    });
  }

  private createMultipleUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { entityType, fieldType } = req.params;
    
    if (!entityType) {
      return res.status(400).json({
        success: false, 
        message: 'entityType parametresi gereklidir'
      });
    }

    if (fieldType !== 'image' && fieldType !== 'template') {
      return res.status(400).json({
        success: false,
        message: 'fieldType parametresi image veya template olmalıdır'
      });
    }
    
    const userId = (req as any).user?.id;
    const upload = this.getUploadMiddleware(fieldType, userId);
    
    (req as any).entityType = entityType;
    (req as any).userId = userId;

    upload(req, res, (err: Error) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      req.body.fieldType = fieldType;
      req.body.entityType = entityType;
      req.body.userId = userId;
      req.body.generateThumbnail = true;
      
      next();
    });
  }
}
