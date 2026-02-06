"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhooksController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const webhooks_service_1 = require("./webhooks.service");
const salesforce_webhook_dto_1 = require("./dto/salesforce-webhook.dto");
let WebhooksController = WebhooksController_1 = class WebhooksController {
    webhooksService;
    logger = new common_1.Logger(WebhooksController_1.name);
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
    }
    async handleSalesforceQuotation(webhookData, sfSignature) {
        this.logger.log(`Received Salesforce webhook for quotation ${webhookData.salesforceQuoteId}`);
        const isValid = await this.webhooksService.verifySalesforceSignature(webhookData, sfSignature);
        if (!isValid) {
            this.logger.warn('Invalid Salesforce signature, rejecting webhook');
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        }
        const isProcessed = await this.webhooksService.checkIdempotency(webhookData.salesforceQuoteId, webhookData.lastModifiedDate);
        if (isProcessed) {
            this.logger.log(`Webhook already processed for ${webhookData.salesforceQuoteId} at ${webhookData.lastModifiedDate}`);
            return { status: 'already_processed' };
        }
        try {
            const result = await this.webhooksService.processQuotationUpdate(webhookData);
            this.logger.log(`Webhook processed successfully for quotation ${webhookData.salesforceQuoteId}`);
            return {
                status: 'success',
                quotationId: result.quotationId,
                emailSent: result.emailSent,
            };
        }
        catch (error) {
            this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to process webhook');
        }
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('salesforce/quotation'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Salesforce Quotation Webhook',
        description: 'Receives quotation updates from Salesforce (phase changes, pricing, notes)',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-salesforce-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [salesforce_webhook_dto_1.SalesforceQuotationWebhookDto, String]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleSalesforceQuotation", null);
exports.WebhooksController = WebhooksController = WebhooksController_1 = __decorate([
    (0, swagger_1.ApiTags)('Webhooks'),
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map