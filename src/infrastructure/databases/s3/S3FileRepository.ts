import { UploadOptions, UploadResult } from "../../../domain/interfaces/IFileUploadService";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { s3Client } from "../../../config/AwsBucketConfig";
import { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { constants } from "../../../constants";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Request } from "express";
import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import fs from "fs";

// Şu an yüklü olmayan multer-s3 için kendi basit implementasyonumuzu yapalım
const multerS3Storage = (opts: any) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Temporary storage before uploading to S3
      cb(null, 'temp-uploads');
    },
    filename: (req, file, cb) => {
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      
      // S3 key'i ve filename'i request objesine kaydet
      // TS hatası almamak için tip assertion kullanıyoruz
      (req as any).s3Key = opts.key(req, file, uniqueName);
      (req as any).s3Filename = uniqueName;
      
      cb(null, uniqueName);
    }
  });
};

export class S3FileRepository implements IFileRepository  {
  private bucketName: string;
  private defaultAllowedExtensions: string[];
  private defaultMaxFileSize: number;
  private s3Client: any;

  // Farklı dosya türleri için konfigürasyon
  private uploadConfigs = {
    logo: {
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.svg'],
      maxFileSize: 2 * 1024 * 1024, // 2MB
      generateThumbnail: false,
      multiple: false
    },
    image: {
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      generateThumbnail: true,
      multiple: true
    },
    icon: {
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.svg'],
      maxFileSize: 1 * 1024 * 1024, // 1MB
      generateThumbnail: false,
      multiple: false
    },
    template: {
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      generateThumbnail: false,
      multiple: true
    },
    // Yeni video konfigürasyonu
    video: {
      allowedExtensions: ['.mp4', '.mov', '.avi', '.wmv', '.webm'],
      maxFileSize: 25 * 1024 * 1024, // 25MB
      generateThumbnail: true,
      multiple: false
    },
  };

  constructor() {
    this.bucketName = constants.AWS_BUCKET_NAME || "filayo-uploads";
    this.defaultAllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".mp4", ".mov", ".avi", ".webm"];
    this.defaultMaxFileSize = 10 * 1024 * 1024; // 10MB
    this.s3Client = s3Client;

    if (!fs.existsSync('temp-uploads')) {
      fs.mkdirSync('temp-uploads', { recursive: true });
    }
  }

  private getS3Key(entityType: string, userId: string, filename: string): string {
    if (userId) {
      return `${entityType}/${userId}/${filename}`;
    }
    // Yoksa mevcut yapıyı kullan
    return `${entityType}/${filename}`;
  }

  getUploadConfig(fieldType: string): UploadOptions {
    const config = this.uploadConfigs[fieldType as keyof typeof this.uploadConfigs] || {
      allowedExtensions: this.defaultAllowedExtensions,
      maxFileSize: this.defaultMaxFileSize,
      generateThumbnail: false
    };
    
    return {
      ...config,
      fieldName: fieldType,
      entityType: fieldType, // Değiştirilebilir
      acl: 'public-read'
    };
  }

  createUploadMiddleware(options: UploadOptions) {
    // Field tipine göre konfigürasyon ekle
    if (options.fieldName && !options.allowedExtensions) {
      const fieldConfig = this.getUploadConfig(options.fieldName);
      // Field konfigürasyonunu varsayılan olarak kullan, ancak options'dan gelenler öncelikli olsun
      options = {
        ...fieldConfig,
        ...options
      };
    }
    
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'temp-uploads');
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        
        // EntityType ve userId'yi request'ten al
        const entityType = (req as any).entityType || options.entityType;
        const userId = (req as any).userId || options.userId || '';

        // S3 keyleri ve filenameleri request objesine kaydet
        if (!(req as any).s3Keys) {
          (req as any).s3Keys = [];
          (req as any).s3Filenames = [];
        }

        // S3 key'i ve filename'i request objesine kaydet
        const s3Key = this.getS3Key(entityType, userId, uniqueName);
        (req as any).s3Keys.push(s3Key);
        (req as any).s3Filenames.push(uniqueName);
        
        cb(null, uniqueName);
      }
    });

    const multerConfig = {
      storage,
      limits: {
        fileSize: options.maxFileSize || this.defaultMaxFileSize
      },
      fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const allowedExtensions = options.allowedExtensions || this.defaultAllowedExtensions;
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedExtensions.includes(ext)) {
          cb(null, true);
        } else {
          // Error tipini doğru şekilde ele al
          const error: any = new Error(`Desteklenmeyen dosya formatı. İzin verilen formatlar: ${allowedExtensions.join(', ')}`);
          cb(error as unknown as null, false);
        }
      }
    };

    // Eğer konfigürasyon çoklu dosya yüklemeyi destekliyorsa (multiple: true)
    const uploadHandler = multer(multerConfig);
    const fieldConfig = this.uploadConfigs[options.fieldName as keyof typeof this.uploadConfigs];
    
    if (fieldConfig && fieldConfig.multiple) {
      return uploadHandler.array('files', 5);
    } else {
      return uploadHandler.single('file');
    }
  }

  async uploadFile(file: Express.Multer.File, options: UploadOptions): Promise<UploadResult> {
    try {
      const { entityType, userId, generateThumbnail } = options;
      
      // Multer ile kaydedilen dosyayı S3'e yükle
      const uniqueName = path.basename(file.path);
      const key = this.getS3Key(entityType, userId || '', uniqueName);
      
      // Dosyayı oku
      const fileBuffer = fs.readFileSync(file.path);
      
      // S3'e yükle
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: file.mimetype,
        // ACL tipini düzelt (AWS SDK v3 için)
        // ACL: options.acl as any || 'public-read'
      }));
      
      // Sonuç nesnesini hazırla
      const result: UploadResult = {
        filename: uniqueName,
        originalName: file.originalname,
        key: key,
        url: await this.getFileUrl(entityType, userId || '', uniqueName),
        mimeType: file.mimetype,
        size: file.size
      };
      
      // Thumbnail oluştur (istenirse ve desteklenen formatta ise)
      if (generateThumbnail) {
        try {
          if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
            // Resim dosyaları için thumbnail oluştur
            const thumbBuffer = await sharp(fileBuffer)
              .resize(200, 200, { fit: 'inside' })
              .toBuffer();
            
            const thumbFilename = `thumb_${uniqueName}`;
            const thumbKey = this.getS3Key(entityType, userId || '', thumbFilename);
            
            await this.s3Client.send(new PutObjectCommand({
              Bucket: this.bucketName,
              Key: thumbKey,
              Body: thumbBuffer,
              ContentType: file.mimetype
            }));
            
            result.thumbnailUrl = await this.getFileUrl(entityType, userId || '', thumbFilename);
            result.thumbnailKey = thumbKey;
          } 
          else if (file.mimetype.startsWith('video/')) {
            // Video dosyaları için thumbnail oluştur (ffmpeg gerektiriyor)
            // Bu kısmı genişletmek için ffmpeg entegrasyonu gerekiyor
            // Şu an için boş bırakıyoruz, ileri düzeyde ffmpeg ile yapılabilir
            console.log('Video thumbnail oluşturma işlemi ileride ffmpeg ile yapılabilir');
          }
        } catch (error) {
          console.error('Thumbnail oluşturma hatası:', error);
        }
      }

      // Geçici dosyayı temizle
      try {
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error('Geçici dosya temizleme hatası:', error);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Dosya S3'e yüklenirken hata oluştu: 
        ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  // Çoklu dosya yükleme için yeni metod
  async uploadMultipleFiles(files: Express.Multer.File[], options: UploadOptions): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, options);
        results.push(result);
      } catch (error) {
        console.error(`Dosya yükleme hatası (${file.originalname}):`, error);
        // Hata olsa bile devam et, diğer dosyaları yüklemeye çalış
      }
    }
    
    return results;
  }


  async getFileUrl(entityType: string, userId: string, filename: string): Promise<string> {
    const key = this.getS3Key(entityType, userId, filename);
    
    // CDN veya S3 URL kullanımı
    if (constants.USE_CLOUDFRONT && constants.CLOUDFRONT_DOMAIN) {
      return `https://${constants.CLOUDFRONT_DOMAIN}/${key}`;
    }
    
    // Pre-signed URL oluştur (isteğe bağlı)
    if (constants.USE_PRESIGNED_URLS) {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });
      
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 saat için geçerli bir URL oluştur
    }
    
    // Standart S3 URL
    return `https://${this.bucketName}.s3.${constants.AWS_REGION}.amazonaws.com/${key}`;
  }

  async deleteFile(entityType: string, userId: string, filename: string): Promise<boolean> {
    try {
      const key = this.getS3Key(entityType, userId, filename);
      
      // Dosyayı sil
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      }));
      
      // Thumbnail varsa onu da sil
      const thumbKey = this.getS3Key(entityType, userId, `thumb_${filename}`);
      try {
        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: thumbKey
        }));
      } catch (error) {
        // Thumbnail bulunamadıysa hata verme
        console.log('Thumbnail bulunamadı, bu normal olabilir.');
      }
      
      return true;
    } catch (error) {
      console.error('Dosya silinirken hata oluştu:', error);
      return false;
    }
  }
}
