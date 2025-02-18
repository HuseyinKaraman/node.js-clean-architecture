import mongoose, { Model } from "mongoose";
import { UserDocument } from "../../infrastructure/databases/mongoose/model/UserModel";

export class DatabaseFactory {
  private static userModel: Model<UserDocument>;

  static getUserModel(): Model<UserDocument> {
    if (!this.userModel) {
      try {
        this.userModel = mongoose.model<UserDocument>("User");
      } catch (error) {
        const userSchema = new mongoose.Schema({
          username: String,
          email: String,
          password: String,
          refreshToken: String,
          createdAt: Date,
        });
        this.userModel = mongoose.model<UserDocument>("User", userSchema);
      }
    }
    return this.userModel;
  }

}
