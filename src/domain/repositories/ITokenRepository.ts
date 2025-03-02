import { ITokenDocument } from "../../infrastructure/databases/mongoose/model/TokenModel";

export interface ITokenRepository {
  /**
   * Yeni bir doğrulama kodu oluşturur
   * @param payload Token içinde saklanacak veri (userId ObjectId olarak bekleniyor)
   * @param expiresIn Kodun geçerlilik süresi (örn: "10m", "1h", "7d")
   * @returns Oluşturulan doğrulama kodu
   */
  generate(payload: any, expiresIn?: string): Promise<string>;
  
  /**
   * Doğrulama kodunu doğrular
   * @param code Doğrulanacak kod
   * @returns Kod ile ilişkilendirilmiş payload
   */
  verify(code: string, action: string): Promise<ITokenDocument | null>;
  
  /**
   * Token'ı geçersiz kılar
   * @param tokenId Token ID'si
   * @returns İşlem başarılı mı
   */
  invalidate(tokenId: string): Promise<boolean>;
  
  /**
   * Belirli bir kullanıcıya ve işleme ait token'ları bulur
   * @param userId Kullanıcı ID'si (string olarak)
   * @param action İşlem türü
   * @returns Token listesi
   */
  findByUserIdAndAction(userId: string, action: string, code?: string): Promise<ITokenDocument | null>;

  /**
   * Belirli bir kullanıcıya ve işleme ait token'ları bulur
   * @param action İşlem türü
   * @param code Doğrulama kodu
   * @returns Token listesi
   */
  findByCodeAndAction(action: string, code?: string): Promise<ITokenDocument | null>;

  /**
   * Süresi dolmuş token'ları temizler
   * @returns Silinen token sayısı
   */
  deleteExpiredTokens(): Promise<number>;
}