import mongoose, { Schema, Document, Types } from 'mongoose';

export enum TokenAction {
  RESET_PASSWORD = 'RESET_PASSWORD',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
}

export interface ITokenDocument extends Document {
  _id?: Types.ObjectId;
  code: string;
  userId: Types.ObjectId;
  action: string;
  payload: any;
  expiresAt: Date;
  isValid: boolean;
  createdAt: Date;
}

const TokenSchema: Schema = new Schema({
  code: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, enum: Object.values(TokenAction), required: true, index: true },
  payload: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true, index: true },
  isValid: { type: Boolean, default: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
});

// İndexler
TokenSchema.index({ userId: 1, action: 1, isValid: 1 });
TokenSchema.index({ expiresAt: 1, isValid: 1 });
TokenSchema.index({ code: 1, isValid: 1 });

export const TokenModel = mongoose.model<ITokenDocument>('Token', TokenSchema);