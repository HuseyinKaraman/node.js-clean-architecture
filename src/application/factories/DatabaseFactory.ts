import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { MongooseTokenRepository } from '../../infrastructure/databases/mongoose/MongooseTokenRepository';
import { MongooseUserRepository } from '../../infrastructure/databases/mongoose/MongooseUserRepository';
import { TokenModel } from '../../infrastructure/databases/mongoose/model/TokenModel';
import { UserModel } from '../../infrastructure/databases/mongoose/model/UserModel';
import { IFileRepository } from '../../domain/repositories/IFileRepository';
import { S3FileRepository } from '../../infrastructure/databases/s3/S3FileRepository';

export class DatabaseFactory {
  private static userRepository: IUserRepository;
  private static tokenRepository: ITokenRepository;
  private static fileRepository: IFileRepository;

  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new MongooseUserRepository(UserModel);
    }
    return this.userRepository;
  }

  static getTokenRepository(): ITokenRepository {
    if (!this.tokenRepository) {
      this.tokenRepository = new MongooseTokenRepository(TokenModel);
    }
    return this.tokenRepository;
  }

  static getFileRepository() {
    if (!this.fileRepository) {
      this.fileRepository = new S3FileRepository();
    }
    return this.fileRepository;
  }
}