declare global {
  namespace Express {
    interface Request {
      s3Key?: string;
      s3Filename?: string;
    }
  }
}

export interface LocalizedString {
  default: string;  // Varsayılan başlık (zorunlu)
  [key: string]: string;  // Dil kodlarına göre çeviriler
}