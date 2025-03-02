import { BcryptService } from '../../infrastructure/services/BcryptService';
import { JwtService } from '../../infrastructure/services/JwtService';
import { NodemailerService } from '../../infrastructure/services/NodemailerService';
import { TemplateService } from '../../infrastructure/services/TemplateService';
import { IHashService } from '../../domain/interfaces/IHashService';
import { ITokenService } from '../../domain/interfaces/ITokenService';
import { IEmailService } from '../../domain/interfaces/IEmailService';
import { ITemplateService } from '../../domain/interfaces/ITemplateService';

export class ServiceFactory {
  private static hashService: IHashService;
  private static tokenService: ITokenService;
  private static templateService: ITemplateService;
  private static emailService: IEmailService;

  static getHashService(): IHashService {
    if (!this.hashService) {
      this.hashService = new BcryptService();
    }
    return this.hashService;
  }

  static getTokenService(): ITokenService {
    if (!this.tokenService) {
      this.tokenService = new JwtService();
    }
    return this.tokenService;
  }

  static getTemplateService(): ITemplateService {
    if (!this.templateService) {
      this.templateService = new TemplateService();
    }
    return this.templateService;
  }

  static getEmailService(): IEmailService {
    if (!this.emailService) {
      const templateService = this.getTemplateService();
      this.emailService = new NodemailerService(templateService);
    }
    return this.emailService;
  }
}