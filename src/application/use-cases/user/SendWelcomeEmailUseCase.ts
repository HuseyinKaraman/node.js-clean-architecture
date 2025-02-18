import { IEmailService } from "../../../domain/interfaces/IEmailService";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class SendWelcomeEmailUseCase {
    constructor(
        private emailService: IEmailService,
        private userRepository: IUserRepository
    ) {}

    async execute(userId: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        await this.emailService.send({
            to: user.email,
            subject: 'Welcome!',
            template: 'welcome',
            context: {
                name: user.username,
                email: user.email
            }
        });
    }
}