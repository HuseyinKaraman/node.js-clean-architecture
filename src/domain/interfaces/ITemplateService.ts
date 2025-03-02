export interface ITemplateService {
    render(templateFn: Function, data: Record<string, any>): string;
  }