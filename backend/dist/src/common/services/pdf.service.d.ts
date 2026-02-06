import { ConfigService } from '@nestjs/config';
export declare class PdfService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    generatePdf(html: string, options?: {
        filename?: string;
    }): Promise<Buffer>;
    renderTemplate(template: string, data: Record<string, any>): string;
    private escapeHtml;
    loadTemplate(templatePath: string): Promise<string>;
}
