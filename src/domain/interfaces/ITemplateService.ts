export interface ITemplateService {
    render(template: string, data: Record<string, any>): string;
}