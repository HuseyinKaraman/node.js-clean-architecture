import { IFileRepository } from "../../domain/repositories/IFileRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { UserModel } from "../../infrastructure/databases/mongoose/model/UserModel";
import { MongooseUserRepository } from "../../infrastructure/databases/mongoose/MongooseUserRepository";
import { S3FileRepository } from "../../infrastructure/databases/s3/S3FileRepository";

export class DatabaseFactory {
  private static userRepository: IUserRepository;
  private static fileRepository: IFileRepository;

  static getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new MongooseUserRepository(UserModel);
    }
    return this.userRepository;
  }

  static getFileRepository() {
    if (!this.fileRepository) {
      this.fileRepository = new S3FileRepository();
    }
    return this.fileRepository;
  }
}
