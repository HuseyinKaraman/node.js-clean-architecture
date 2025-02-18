import nodemailer from 'nodemailer';
import { IEmailService, EmailOptions } from '../../domain/interfaces/IEmailService';
import { ITemplateService } from '../../domain/interfaces/ITemplateService';
import { emailTemplates } from '../templates/emailTemplates';

export class NodemailerService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor(private templateService: ITemplateService) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT!),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async send(options: EmailOptions): Promise<void> {
        try {
            const template = emailTemplates[options.template as keyof typeof emailTemplates];
            if (!template) {
                throw new Error(`Template ${options.template} not found`);
            }

            const html = this.templateService.render(template, options.context || {});

            await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: options.to,
                subject: options.subject,
                html
            });
        } catch (error) {
            throw new Error('Email sending failed: ' + (error as Error).message);
        }
    }}