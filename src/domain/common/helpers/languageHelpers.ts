import { LocalizedString } from '../types';

/**
 * LocalizedString nesnesi içindeki dil kodlarını normalize eder.
 * "default" anahtarını olduğu gibi korur, diğer tüm dil kodlarını küçük harfe çevirir.
 * 
 * @param localizedString - Normalize edilecek LocalizedString nesnesi
 * @returns Dil kodları normalize edilmiş yeni bir LocalizedString nesnesi
 */
export function normalizeLocalizedString(localizedString: LocalizedString): LocalizedString {
  return Object.entries(localizedString).reduce((acc, [key, value]) => {
    // 'default' anahtarını olduğu gibi koru, diğerlerini küçük harfe çevir
    acc[key === 'default' ? key : key.toLowerCase()] = value;
    return acc;
  }, {} as LocalizedString);
}

/**
 * LocalizedString içeren bir nesnenin belirli alanlarını normalize eder
 * 
 * @param obj - İçinde LocalizedString alanları bulunan nesne
 * @param fields - Normalize edilecek LocalizedString alanlarının isimleri
 * @returns Normalize edilmiş alanları içeren yeni bir nesne
 */
export function normalizeLocalizedFields<T>(
  obj: T,
  fields: (keyof T)[]
): T {
  // Orijinal nesnenin bir kopyasını oluştur
  const result = { ...obj };
  
  // Her bir alanı dön ve işle
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'object') {
      // Type assertion kullanarak TypeScript'e bunun LocalizedString olduğunu bildiriyoruz
      const normalized = normalizeLocalizedString(result[field] as unknown as LocalizedString);
      
      // Type assertion ile atama yapıyoruz
      (result[field] as any) = normalized;
    }
  }
  
  return result;
}