"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const email_service_1 = require("../../common/services/email.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let WebhooksService = WebhooksService_1 = class WebhooksService {
    prisma;
    emailService;
    configService;
    logger = new common_1.Logger(WebhooksService_1.name);
    constructor(prisma, emailService, configService) {
        this.prisma = prisma;
        this.emailService = emailService;
        this.configService = configService;
    }
    async verifySalesforceSignature(webhookData, receivedSignature) {
        const webhookSecret = this.configService.get('SALESFORCE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            const nodeEnv = this.configService.get('NODE_ENV', 'development');
            if (nodeEnv === 'development') {
                this.logger.warn('⚠️  Webhook signature verification disabled (development mode)');
                return true;
            }
            this.logger.error('Webhook secret not configured in production');
            return false;
        }
        if (!receivedSignature) {
            this.logger.warn('No x-salesforce-signature header received');
            return false;
        }
        const payload = JSON.stringify(webhookData);
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(payload)
            .digest('base64');
        const isValid = crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature));
        if (!isValid) {
            this.logger.warn(`Signature mismatch. Expected: ${expectedSignature}, Received: ${receivedSignature}`);
        }
        return isValid;
    }
    async checkIdempotency(salesforceQuoteId, lastModifiedDate) {
        const quotation = await this.prisma.quotation.findUnique({
            where: { salesforceQuoteId },
            select: { lastSyncAt: true },
        });
        if (!quotation) {
            return false;
        }
        if (!quotation.lastSyncAt) {
            return false;
        }
        const lastSync = quotation.lastSyncAt.toISOString();
        const webhookTimestamp = new Date(lastModifiedDate).toISOString();
        return lastSync >= webhookTimestamp;
    }
    async processQuotationUpdate(webhookData) {
        const { salesforceQuoteId, salesforceQuoteNumber, phase, totalCostCents, ytecNotes } = webhookData;
        const quotation = await this.prisma.quotation.findUnique({
            where: { salesforceQuoteId },
            include: {
                user: true,
                kit: true,
            },
        });
        if (!quotation) {
            throw new common_1.NotFoundException(`Quotation with SF ID ${salesforceQuoteId} not found`);
        }
        const oldPhase = quotation.phase;
        const newPhase = this.mapSalesforcePhase(phase);
        const updatedQuotation = await this.prisma.quotation.update({
            where: { id: quotation.id },
            data: {
                salesforceQuoteNumber,
                phase: newPhase,
                totalCostCents: totalCostCents ?? quotation.totalCostCents,
                ytecNotes: ytecNotes ?? quotation.ytecNotes,
                lastSyncAt: new Date(),
            },
        });
        this.logger.log(`Quotation ${quotation.id} updated: ${oldPhase} → ${newPhase}, cost: €${(totalCostCents || 0) / 100}`);
        let emailSent = false;
        if (oldPhase !== newPhase && this.shouldNotifyPhaseChange(oldPhase, newPhase)) {
            try {
                await this.sendPhaseChangeEmail(quotation, oldPhase, newPhase);
                emailSent = true;
                this.logger.log(`Phase change email sent to ${quotation.user.email}`);
            }
            catch (error) {
                this.logger.error(`Failed to send phase change email: ${error.message}`);
            }
        }
        return {
            quotationId: quotation.id,
            oldPhase,
            newPhase,
            emailSent,
        };
    }
    mapSalesforcePhase(sfPhase) {
        const phaseMap = {
            'Bozza': client_1.QuotationPhase.DRAFT,
            'Inviato a YTEC': client_1.QuotationPhase.SUBMITTED,
            'Preventivo Pronto': client_1.QuotationPhase.READY,
            'Chiuso': client_1.QuotationPhase.CLOSED,
        };
        return phaseMap[sfPhase] || client_1.QuotationPhase.DRAFT;
    }
    shouldNotifyPhaseChange(oldPhase, newPhase) {
        const notifyTransitions = [
            [client_1.QuotationPhase.SUBMITTED, client_1.QuotationPhase.READY],
            [client_1.QuotationPhase.READY, client_1.QuotationPhase.CLOSED],
        ];
        return notifyTransitions.some(([from, to]) => oldPhase === from && newPhase === to);
    }
    async sendPhaseChangeEmail(quotation, oldPhase, newPhase) {
        const templatePath = path.join(__dirname, 'templates', 'phase-change-email.html');
        const template = await fs.readFile(templatePath, 'utf-8');
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
        const phaseMessages = {
            [client_1.QuotationPhase.DRAFT]: 'In lavorazione',
            [client_1.QuotationPhase.SUBMITTED]: 'Inviato al team YTEC',
            [client_1.QuotationPhase.READY]: 'Preventivo Pronto! 🎉',
            [client_1.QuotationPhase.CLOSED]: 'Chiuso',
        };
        const templateData = {
            userName: `${quotation.user.firstName || ''} ${quotation.user.lastName || ''}`.trim() || 'Cliente',
            projectName: quotation.projectName,
            quoteNumber: quotation.salesforceQuoteNumber || quotation.id,
            oldPhase: phaseMessages[oldPhase],
            newPhase: phaseMessages[newPhase],
            totalCost: quotation.totalCostCents
                ? `€${(quotation.totalCostCents / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
                : 'Da definire',
            dashboardUrl: `${frontendUrl}/dashboard/quotes/${quotation.id}`,
            ytecNotes: quotation.ytecNotes || '',
        };
        const html = this.emailService.renderTemplate(template, templateData);
        await this.emailService.sendEmail({
            to: quotation.user.orderEmail || quotation.user.email,
            subject: `Aggiornamento Preventivo - ${quotation.projectName}`,
            html,
        });
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService,
        config_1.ConfigService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map