import { ITokenRepository } from '../../../domain/repositories/ITokenRepository';
import { Model, Types } from 'mongoose';
import { ITokenDocument, TokenModel } from './model/TokenModel';

export class MongooseTokenRepository implements ITokenRepository {
  private tokenModel: Model<ITokenDocument>;
  
  constructor(tokenModel: Model<ITokenDocument> = TokenModel) {
    this.tokenModel = tokenModel;
  }

  async generate(payload: any, expiresIn: string = '1h'): Promise<string> {
    // 6 haneli bir doğrulama kodu oluştur
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Token süresi hesaplama
    const expiresAt = new Date();
    if (expiresIn.endsWith('m')) {
      expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiresIn));
    } else if (expiresIn.endsWith('h')) {
      expiresAt.setHours(expiresAt.getHours() + parseInt(expiresIn));
    } else if (expiresIn.endsWith('d')) {
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiresIn));
    }
    
    // userId'yi ObjectId'ye dönüştür
    const userObjectId = new Types.ObjectId(payload.userId);
    
    // Veritabanına kaydediyoruz
    await this.tokenModel.create({
      code: verificationCode,
      userId: userObjectId,
      action: payload.action,
      payload,
      expiresAt,
      isValid: true,
      createdAt: new Date()
    });
    
    return verificationCode;
  }
  
  async verify(code: string, action: string): Promise<ITokenDocument | null> {
    try {
      // Doğrulama kodunu veritabanında arıyoruz
      const storedToken = await this.tokenModel.findOne({ 
        code,
        action,
        isValid: true,
        expiresAt: { $gt: new Date() }
      });
      
      if (!storedToken) {
        throw new Error('Geçersiz kod veya süresi dolmuş');
      }
      
      return storedToken;
    } catch (error) {
      throw new Error('Geçersiz doğrulama kodu');
    }
  }
  
  async invalidate(tokenId: string): Promise<boolean> {
    const result = await this.tokenModel.deleteOne({ _id: tokenId });
    
    return result.deletedCount === 1;
  }
  
  async findByUserIdAndAction(userId: string, action: string, code?: string): Promise<ITokenDocument | null> {
    const userObjectId = new Types.ObjectId(userId);
    
    const token = await this.tokenModel.findOne({
      userId: userObjectId,
      action,
      isValid: true,
      ...(code && { code }),
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    return token;
  }

  async findByCodeAndAction(action: string, code: string): Promise<ITokenDocument | null> {    
    const token = await this.tokenModel.findOne({
      action,
      isValid: true,
      ...(code && { code }),
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    return token;
  }
  

  async deleteExpiredTokens(): Promise<number> {
    const result = await this.tokenModel.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isValid: false }
      ]
    });
    
    return result.deletedCount;
  }
}