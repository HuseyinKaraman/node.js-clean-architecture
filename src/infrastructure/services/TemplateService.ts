import { ITemplateService } from '../../domain/interfaces/ITemplateService';

export class TemplateService implements ITemplateService {
  render(templateFn: Function, data: Record<string, any>): string {
    // Önce template fonksiyonunu çağır ve HTML içeriğini al
    let htmlContent: string;
    
    // Template fonksiyonunun parametrelerini doğru şekilde geçir
    if (data.verificationCode) {
      htmlContent = templateFn(data.verificationCode);
    } else if (data.deleteAccountCode) {
      htmlContent = templateFn(data.deleteAccountCode);
    } else if (data.resetCode && data.frontendUrl) {
      htmlContent = templateFn(data.frontendUrl, data.resetCode);
    } else if (data.userName) {
      htmlContent = templateFn(data.userName);
    } else {
      // Parametre gerektirmeyen templateler için
      htmlContent = templateFn();
    }
    
    // Sonra kalan değişkenleri replace et
    return htmlContent.replace(/\{\{(\s*\w+\s*)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return data[trimmedKey] !== undefined ? String(data[trimmedKey]) : match;
    });
  }
}