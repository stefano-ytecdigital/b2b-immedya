import { ConfigService } from '@nestjs/config';
export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string;
    }>;
}
export declare class EmailService {
    private configService;
    private readonly logger;
    private transporter;
    constructor(configService: ConfigService);
    private initializeTransporter;
    sendEmail(options: EmailOptions): Promise<void>;
    renderTemplate(template: string, data: Record<string, any>): string;
}
