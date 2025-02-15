import mongoose from "mongoose";
import { User } from "../../domain/entities/User";
import { UserDocument } from "../../infrastructure/databases/mongoose/model/UserModel";
export interface IUserUseCase {
  createUser(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }>;
  getUser(userId: string): Promise<User | null>;
  loginUser(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }>;
  comparePassword(password: string, hashPassword: string): Promise<Boolean>;
  refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }>;
  logout(
    refreshToken: string
  ): Promise<Boolean>
}
