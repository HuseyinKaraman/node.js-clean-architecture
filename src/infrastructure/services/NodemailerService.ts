import nodemailer from "nodemailer";
import { IEmailService, EmailOptions } from "../../domain/interfaces/IEmailService";
import { ITemplateService } from "../../domain/interfaces/ITemplateService";
import { emailTemplates } from "../templates/emailTemplates";
import { constants } from "../../constants";

export class NodemailerService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor(private templateService: ITemplateService) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: constants.SENDER_EMAIL,
        pass: constants.SENDER_EMAIL_PASSWORD,
      },
    });
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      const templateFn = emailTemplates[options.template];
      if (!templateFn) {
        throw new Error(`Template ${options.template} not found`);
      }

      // Template service render işlemini templateFn ile yapacak
      const html = this.templateService.render(templateFn, options.context || {});

      await this.transporter.sendMail({
        from: constants.SENDER_EMAIL,
        to: options.to,
        subject: options.subject,
        html,
      });
    } catch (error) {
      throw new Error("Email sending failed: " + (error as Error).message);
    }
  }
}
