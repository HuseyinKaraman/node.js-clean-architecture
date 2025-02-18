import dotenv from 'dotenv';
dotenv.config();


class Contants {
  public DEVELOPMENT_DATABASE_URL: string | undefined;
  public PRODUCTION_DATABASE_URL: string | undefined;
  public ACCESS_TOKEN_SECRET: string | undefined;
  public RESET_TOKEN_SECRET: string | undefined;
  public DELETION_TOKEN_SECRET: string | undefined;
  public AWS_ACCESS_KEY: string | undefined;
  public AWS_SECRET_KEY: string | undefined;
  public AWS_REGION: string | undefined;
  public NODE_ENV: string | undefined;
  public API_PREFIX: string | undefined;
  public API_URL: string | undefined;
  public PORT: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public CLIENT_URL: string | undefined;

  constructor() {
    this.DEVELOPMENT_DATABASE_URL = process.env.DEVELOPMENT_DATABASE_URL
    this.PRODUCTION_DATABASE_URL = process.env.PRODUCTION_DATABASE_URL
    this.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    this.RESET_TOKEN_SECRET = process.env.RESET_TOKEN_SECRET
    this.DELETION_TOKEN_SECRET = process.env.DELETION_TOKEN_SECRET
    this.AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY
    this.AWS_SECRET_KEY = process.env.AWS_SECRET_KEY
    this.AWS_REGION = process.env.AWS_REGION
    this.NODE_ENV = process.env.NODE_ENV
    this.API_PREFIX = process.env.API_PREFIX
    this.API_URL = process.env.API_URL
    this.PORT = process.env.PORT
    this.SENDER_EMAIL = process.env.SENDER_EMAIL
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD
    this.CLIENT_URL = process.env.CLIENT_URL
  }
}

export const constants: Contants = new Contants();