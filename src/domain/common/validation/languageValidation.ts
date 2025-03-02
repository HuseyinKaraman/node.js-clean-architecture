import { LocalizedString } from "../types";

export const validateLanguageCodes = (
  providedCodes: string[],
  activeLanguageCodes: string[]
): string[] => {
  return providedCodes.filter(code => !activeLanguageCodes.includes(code.toLowerCase()));
};

export const validateLocalizedString = (data: LocalizedString, field: string) => {
  // En az bir dil olmalı
  if (Object.keys(data).length === 0) {
    throw new Error(`${field} must have at least one language`);
  }

  // Dil kodları geçerli formatta olmalı
  for (const langCode of Object.keys(data)) {
    if (!isValidLanguageCode(langCode)) {
      throw new Error(`Invalid language code "${langCode}" in ${field}`);
    }
  }
}

export const isValidLanguageCode = (code: string): boolean => {
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(code);
}