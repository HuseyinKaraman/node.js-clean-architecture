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
      generateThumbnail: false
    },
    image: {
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      generateThumbnail: true
    },
    icon: {
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.svg'],
      maxFileSize: 1 * 1024 * 1024, // 1MB
      generateThumbnail: false
    },
    template: {
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      generateThumbnail: false
    }
  };

  constructor() {
    this.bucketName = constants.AWS_BUCKET_NAME || "filayo-uploads";
    this.defaultAllowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg"];
    this.defaultMaxFileSize = 5 * 1024 * 1024; // 5MB
    this.s3Client = s3Client;

    const fs = require('fs');
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

        // S3 key'i ve filename'i request objesine kaydet
        (req as any).s3Key = this.getS3Key(entityType, userId, uniqueName);
        (req as any).s3Filename = uniqueName;
        
        cb(null, uniqueName);
      }
    });

    return multer({
      storage,
      limits: {
        fileSize: options.maxFileSize || this.defaultMaxFileSize
      },
      fileFilter: (req, file, cb) => {
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
    });
  }

  async uploadFile(file: Express.Multer.File, options: UploadOptions): Promise<UploadResult> {
    try {
      const { entityType, userId, generateThumbnail } = options;
      
      // Multer ile kaydedilen dosyayı S3'e yükle
      const uniqueName = path.basename(file.path);
      const key = this.getS3Key(entityType, userId || '', uniqueName);
      
      // Dosyayı oku
      const fs = require('fs');
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
      if (generateThumbnail && file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
        try {
          // Thumbnail oluştur
          const thumbBuffer = await sharp(fileBuffer)
            .resize(200, 200, { fit: 'inside' })
            .toBuffer();
          
          // Thumbnail adını belirle
          const thumbFilename = `thumb_${uniqueName}`;
          const thumbKey = this.getS3Key(entityType, userId || '', thumbFilename);
          
          // Thumbnail'i S3'e yükle
          await this.s3Client.send(new PutObjectCommand({
            Bucket: this.bucketName,
            Key: thumbKey,
            Body: thumbBuffer,
            ContentType: file.mimetype,
            // ACL: options.acl as any || 'public-read'
          }));
          
          // Thumbnail URL'sini ekle
          result.thumbnailUrl = await this.getFileUrl(entityType, userId || '', thumbFilename);
          result.thumbnailKey = thumbKey;
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
      console.error('Dosya yükleme hatası:', error);
      throw new Error(`Dosya S3'e yüklenirken hata oluştu: 
        ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
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
