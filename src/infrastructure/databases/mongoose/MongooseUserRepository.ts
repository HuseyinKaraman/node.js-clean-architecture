import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { User } from "../../../domain/entities/User";
import { UserDocument, UserModel } from "./model/UserModel";
import { Model } from "mongoose";

export class MongooseUserRepository implements IUserRepository {
  private userModel: Model<UserDocument>;

  constructor(userModel: Model<UserDocument> = UserModel) {
    this.userModel = userModel;
  }

  async create(user: User): Promise<User> {
    const createdUser = await this.userModel.create(user);
    // toJSON ile hassas alanları filtrelenmiş şekilde dönecek
    return createdUser.toJSON();
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email })
    if (!user) {
      return null;
    }

    return user.toJSON();
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id)
    if (!user) {
      return null;
    }

    // toJSON ile hassas alanları filtrelenmiş şekilde dönecek
    return user.toJSON();
  }

  async findAll(criteria?: Partial<User>): Promise<User[]> {
    const users = await this.userModel.find(criteria || {})
    // Her kullanıcı için toJSON kullanarak hassas bilgileri filtrele
    return users.map((user) => user.toJSON());
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: { ...userData, updatedAt: new Date() } }, { new: true })

    if (!updatedUser) {
      return null;
    }

    // toJSON ile hassas alanları filtrelenmiş şekilde dönecek
    return updatedUser.toJSON();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: id },
      {
        password: hashedPassword,
        updatedAt: new Date(),
      }
    );
    return result.modifiedCount > 0;
  }

  async verifyEmail(id: string): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: id },
      {
        emailVerified: true,
        updatedAt: new Date(),
      }
    );
    return result.modifiedCount > 0;
  }

  async updateLastLogin(id: string): Promise<boolean> {
    const result = await this.userModel.updateOne({ _id: id }, { lastLogin: new Date() });
    return result.modifiedCount > 0;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
