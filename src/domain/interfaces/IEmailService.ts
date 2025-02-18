export interface EmailOptions {
    to: string;
    subject: string;
    template: string;
    context?: Record<string, any>;
}

export interface IEmailService {
    send(options: EmailOptions): Promise<void>;
}