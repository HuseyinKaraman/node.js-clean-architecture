// IEmailService.ts (güncellenmiş arayüz)
export interface EmailOptions {
    to: string;
    subject: string;
    template: keyof typeof import('../../infrastructure/templates/emailTemplates').emailTemplates;
    context: Record<string, any>;
  }
  
  export interface IEmailService {
    send(options: EmailOptions): Promise<void>;
  }