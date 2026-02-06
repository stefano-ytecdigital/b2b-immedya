import { WebhooksService } from './webhooks.service';
import { SalesforceQuotationWebhookDto } from './dto/salesforce-webhook.dto';
export declare class WebhooksController {
    private readonly webhooksService;
    private readonly logger;
    constructor(webhooksService: WebhooksService);
    handleSalesforceQuotation(webhookData: SalesforceQuotationWebhookDto, sfSignature?: string): Promise<{
        status: string;
        quotationId?: undefined;
        emailSent?: undefined;
    } | {
        status: string;
        quotationId: string;
        emailSent: boolean;
    }>;
}
