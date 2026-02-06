import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/services/email.service';
import { SalesforceQuotationWebhookDto } from './dto/salesforce-webhook.dto';
export declare class WebhooksService {
    private prisma;
    private emailService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, emailService: EmailService, configService: ConfigService);
    verifySalesforceSignature(webhookData: SalesforceQuotationWebhookDto, receivedSignature?: string): Promise<boolean>;
    checkIdempotency(salesforceQuoteId: string, lastModifiedDate: string): Promise<boolean>;
    processQuotationUpdate(webhookData: SalesforceQuotationWebhookDto): Promise<{
        quotationId: string;
        oldPhase: import("@prisma/client").$Enums.QuotationPhase;
        newPhase: import("@prisma/client").$Enums.QuotationPhase;
        emailSent: boolean;
    }>;
    private mapSalesforcePhase;
    private shouldNotifyPhaseChange;
    private sendPhaseChangeEmail;
}
