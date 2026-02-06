import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { WebhooksService } from './webhooks.service';
import { SalesforceQuotationWebhookDto } from './dto/salesforce-webhook.dto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  /**
   * Salesforce Quotation Webhook
   * Called by Salesforce when quotation phase changes
   */
  @Public()
  @Post('salesforce/quotation')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Hide from Swagger (internal webhook)
  @ApiOperation({
    summary: 'Salesforce Quotation Webhook',
    description: 'Receives quotation updates from Salesforce (phase changes, pricing, notes)',
  })
  async handleSalesforceQuotation(
    @Body() webhookData: SalesforceQuotationWebhookDto,
    @Headers('x-salesforce-signature') sfSignature?: string,
  ) {
    this.logger.log(`Received Salesforce webhook for quotation ${webhookData.salesforceQuoteId}`);

    // Verify Salesforce signature (SECURITY CRITICAL)
    const isValid = await this.webhooksService.verifySalesforceSignature(
      webhookData,
      sfSignature,
    );

    if (!isValid) {
      this.logger.warn('Invalid Salesforce signature, rejecting webhook');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    // Check idempotency (prevent duplicate processing)
    const isProcessed = await this.webhooksService.checkIdempotency(
      webhookData.salesforceQuoteId,
      webhookData.lastModifiedDate,
    );

    if (isProcessed) {
      this.logger.log(
        `Webhook already processed for ${webhookData.salesforceQuoteId} at ${webhookData.lastModifiedDate}`,
      );
      return { status: 'already_processed' };
    }

    // Process webhook
    try {
      const result = await this.webhooksService.processQuotationUpdate(webhookData);

      this.logger.log(
        `Webhook processed successfully for quotation ${webhookData.salesforceQuoteId}`,
      );

      return {
        status: 'success',
        quotationId: result.quotationId,
        emailSent: result.emailSent,
      };
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to process webhook');
    }
  }
}
