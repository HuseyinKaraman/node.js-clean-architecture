import { ITemplateService } from '../../domain/interfaces/ITemplateService';

export class TemplateService implements ITemplateService {
    render(template: string, data: Record<string, any>): string {
        return template.replace(/\{\{(\s*\w+\s*)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            return data[trimmedKey] || match;
        });
    }
}