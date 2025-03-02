export interface UploadOptions {
  entityType: string;  // 'user', 'product', 'benefit', vb.
  fieldName: string;   // 'logo', 'image', 'avatar', vb.
  userId?: string;
  allowedExtensions?: string[];
  maxFileSize?: number; // byte cinsinden
  generateThumbnail?: boolean;
  acl?: string; // S3 için ACL ayarları
}

export interface UploadResult {
  filename: string;
  originalName: string;
  key: string;        // S3 key
  url: string;        // S3 URL
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
  thumbnailKey?: string;
}

