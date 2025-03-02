import dotenv from 'dotenv';
dotenv.config();


class Contants {
  public DEVELOPMENT_DATABASE_URL: string | undefined;
  public PRODUCTION_DATABASE_URL: string | undefined;
  public ACCESS_TOKEN_SECRET: string | undefined;
  public RESET_TOKEN_SECRET: string | undefined;
  public DELETION_TOKEN_SECRET: string | undefined;
  public NODE_ENV: string | undefined;
  public API_PREFIX: string | undefined;
  public API_URL: string | undefined;
  public PORT: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public CLIENT_URL: string | undefined;
  // AWS bilgileri
  public AWS_REGION: string | undefined;
  public AWS_BUCKET_NAME: string | undefined;
  public AWS_ACCESS_KEY_ID: string | undefined;
  public AWS_SECRET_ACCESS_KEY: string | undefined;
  // S3 uyumlu depolama için opsiyonel ayarlar (MinIO gibi)
  public AWS_ENDPOINT: string | undefined;
  public AWS_FORCE_PATH_STYLE: boolean | undefined;
  // CloudFront
  public USE_CLOUDFRONT: boolean | undefined;
  public CLOUDFRONT_DOMAIN: string | undefined;
  // Pre-signed URLs
  public USE_PRESIGNED_URLS: boolean | undefined;
  public PRESIGNED_URLS_EXPIRES: number | undefined;

  constructor() {
    this.DEVELOPMENT_DATABASE_URL = process.env.DEVELOPMENT_DATABASE_URL
    this.PRODUCTION_DATABASE_URL = process.env.PRODUCTION_DATABASE_URL
    this.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    this.RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET
    this.DELETION_TOKEN_SECRET = process.env.DELETION_TOKEN_SECRET
    this.NODE_ENV = process.env.NODE_ENV
    this.API_PREFIX = process.env.API_PREFIX
    this.API_URL = process.env.API_URL
    this.PORT = process.env.PORT
    this.SENDER_EMAIL = process.env.SENDER_EMAIL
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD
    this.CLIENT_URL = process.env.CLIENT_URL
    this.AWS_REGION = process.env.AWS_REGION
    this.AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
    this.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
    this.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
    this.AWS_ENDPOINT= process.env.AWS_ENDPOINT || '',
    this.AWS_FORCE_PATH_STYLE= process.env.AWS_FORCE_PATH_STYLE === 'true',
    this.USE_CLOUDFRONT= process.env.USE_CLOUDFRONT === 'true' || false,
    this.CLOUDFRONT_DOMAIN= process.env.CLOUDFRONT_DOMAIN || '',
    this.USE_PRESIGNED_URLS= process.env.USE_PRESIGNED_URLS === 'true' || false,
    this.PRESIGNED_URLS_EXPIRES= parseInt(process.env.PRESIGNED_URLS_EXPIRES || '3600', 10)
  }
}

export const constants: Contants = new Contants();