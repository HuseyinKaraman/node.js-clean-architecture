import mongoose, { Schema, model, Document, ObjectId } from 'mongoose';
import bcryptjs from "bcryptjs";

export interface UserDocument extends Document {
  _id:mongoose.Types.ObjectId
  username: string;
  email: string;
  password: string;
  refreshToken: string;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>({
  _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

export const UserModel = model<UserDocument>('User', userSchema);
