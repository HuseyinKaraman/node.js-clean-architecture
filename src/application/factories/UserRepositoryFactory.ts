// src/application/factories/UserRepositoryFactory.ts
import { Model } from 'mongoose';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { MongooseUserRepository } from '../../infrastructure/databases/mongoose/MongooseUserRepository';
import { UserDocument } from '../../infrastructure/databases/mongoose/model/UserModel';

export class UserRepositoryFactory {
  public static create(userModel: Model<UserDocument>): IUserRepository {
    return new MongooseUserRepository(userModel);
  }
}

/*
export class UserRepositoryFactory {
  public static create(type: 'mongoose' | 'postgres', userModel?: Model<UserDocument>): IUserRepository {
    switch (type) {
      case 'mongoose':
        if (!userModel) {
          throw new Error('Mongoose model is required for MongooseUserRepository');
        }
        return new MongooseUserRepository(userModel);
      case 'postgres':
        return new PostgresUserRepository();
      default:
        throw new Error('Unsupported repository type');
    }
  }
}
  */