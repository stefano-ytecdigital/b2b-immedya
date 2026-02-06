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
var StandardConfiguratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardConfiguratorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const pdf_service_1 = require("../../common/services/pdf.service");
const email_service_1 = require("../../common/services/email.service");
const client_1 = require("@prisma/client");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
const jsforce = __importStar(require("jsforce"));
let StandardConfiguratorService = StandardConfiguratorService_1 = class StandardConfiguratorService {
    prisma;
    pdfService;
    emailService;
    configService;
    logger = new common_1.Logger(StandardConfiguratorService_1.name);
    sfConnection;
    constructor(prisma, pdfService, emailService, configService) {
        this.prisma = prisma;
        this.pdfService = pdfService;
        this.emailService = emailService;
        this.configService = configService;
        this.initializeSalesforceConnection();
    }
    initializeSalesforceConnection() {
        this.sfConnection = new jsforce.Connection({
            loginUrl: this.configService.get('SALESFORCE_LOGIN_URL', 'https://login.salesforce.com'),
        });
    }
    async calculateQuote(userId, calculateDto) {
        const { kitId, quantity } = calculateDto;
        const kit = await this.prisma.kit.findUnique({
            where: { id: kitId },
            include: {
                product: true,
                modules: {
                    include: {
                        module: true,
                    },
                },
            },
        });
        if (!kit) {
            throw new common_1.NotFoundException(`Kit with ID ${kitId} not found`);
        }
        const totalPriceCents = kit.totalPriceCents * quantity;
        const totalWidthMm = kit.totalWidthMm;
        const totalHeightMm = kit.totalHeightMm;
        const totalResolutionW = kit.totalResolutionW * quantity;
        const totalResolutionH = kit.totalResolutionH;
        const totalPowerW = kit.modules.reduce((sum, km) => {
            return sum + km.module.powerConsumptionW * km.quantity * quantity;
        }, 0);
        this.logger.log(`Quote calculated for kit ${kit.name} x${quantity}: €${(totalPriceCents / 100).toFixed(2)}`);
        return {
            kit: {
                id: kit.id,
                name: kit.name,
                description: kit.description,
            },
            quantity,
            dimensions: {
                widthMm: totalWidthMm,
                heightMm: totalHeightMm,
            },
            resolution: {
                width: totalResolutionW,
                height: totalResolutionH,
            },
            pixelPitch: kit.pixelPitch,
            estimatedPriceCents: totalPriceCents,
            estimatedPowerConsumptionW: totalPowerW,
            modules: kit.modules.map((km) => ({
                name: km.module.name,
                quantity: km.quantity * quantity,
                dimensions: `${km.module.widthMm}x${km.module.heightMm}mm`,
                unitPriceCents: km.module.unitPriceCents,
            })),
        };
    }
    async generateQuotePdf(userId, createDto) {
        const calculation = await this.calculateQuote(userId, {
            kitId: createDto.kitId,
            quantity: createDto.quantity,
        });
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const templatePath = path.join(__dirname, 'templates', 'quote-pdf.html');
        const template = await this.pdfService.loadTemplate(templatePath);
        const templateData = {
            quoteNumber: 'DRAFT',
            createdAt: new Date().toLocaleDateString('it-IT'),
            projectName: createDto.projectName,
            customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            installationCity: createDto.installationCity || 'N/A',
            requestedDeliveryDate: createDto.requestedDeliveryDate
                ? new Date(createDto.requestedDeliveryDate).toLocaleDateString('it-IT')
                : 'Da definire',
            kitName: calculation.kit.name,
            kitDescription: calculation.kit.description || '',
            kitWidth: (calculation.dimensions.widthMm / 1000).toFixed(2),
            kitHeight: (calculation.dimensions.heightMm / 1000).toFixed(2),
            kitResolution: `${calculation.resolution.width}x${calculation.resolution.height}px`,
            kitPitch: calculation.pixelPitch,
            quantity: calculation.quantity,
            estimatedTotal: (calculation.estimatedPriceCents / 100).toLocaleString('it-IT', {
                minimumFractionDigits: 2,
            }),
            installationDetails: createDto.internetConnection
                ? {
                    internetConnection: this.formatEnum(createDto.internetConnection),
                    contentType: this.formatEnum(createDto.contentType),
                    contentManagement: this.formatEnum(createDto.contentManagement),
                    anchoringSystem: this.formatEnum(createDto.anchoringSystem),
                }
                : null,
            notes: createDto.commercialNotes || createDto.productsDescription || null,
        };
        const html = this.pdfService.renderTemplate(template, templateData);
        const pdfBuffer = await this.pdfService.generatePdf(html);
        this.logger.log(`PDF generated for ${createDto.projectName}`);
        return pdfBuffer;
    }
    async confirmQuotation(userId, createDto) {
        this.logger.log(`Confirming quotation for user ${userId}, project: ${createDto.projectName}`);
        const calculation = await this.calculateQuote(userId, {
            kitId: createDto.kitId,
            quantity: createDto.quantity,
        });
        const pdfBuffer = await this.generateQuotePdf(userId, createDto);
        const quotation = await this.prisma.quotation.create({
            data: {
                userId,
                kitId: createDto.kitId,
                phase: client_1.QuotationPhase.DRAFT,
                projectName: createDto.projectName,
                customerBudgetCents: createDto.customerBudgetCents,
                installationCity: createDto.installationCity,
                requestedDeliveryDate: createDto.requestedDeliveryDate
                    ? new Date(createDto.requestedDeliveryDate)
                    : null,
                internetConnection: createDto.internetConnection,
                contentType: createDto.contentType,
                contentManagement: createDto.contentManagement,
                anchoringSystem: createDto.anchoringSystem,
                anchoringMaterial: createDto.anchoringMaterial,
                customerCategory: createDto.customerCategory,
                hasExistingSoftware: createDto.hasExistingSoftware ?? false,
                needsVideorender: createDto.needsVideorender ?? false,
                productsDescription: createDto.productsDescription,
                commercialNotes: createDto.commercialNotes,
                needsSiteSurvey: createDto.needsSiteSurvey ?? false,
                configurationJson: JSON.stringify(calculation),
                totalCostCents: calculation.estimatedPriceCents,
            },
            include: {
                kit: true,
                user: true,
            },
        });
        this.logger.log(`Quotation created in DB: ${quotation.id}`);
        let sfQuoteId;
        let sfQuoteNumber;
        try {
            const sfResult = await this.createSalesforceQuotation(quotation, createDto);
            sfQuoteId = sfResult.id;
            sfQuoteNumber = sfResult.number;
            await this.prisma.quotation.update({
                where: { id: quotation.id },
                data: {
                    salesforceQuoteId: sfQuoteId,
                    salesforceQuoteNumber: sfQuoteNumber,
                    phase: client_1.QuotationPhase.SUBMITTED,
                    lastSyncAt: new Date(),
                },
            });
            this.logger.log(`Quotation synced to Salesforce: ${sfQuoteNumber}`);
        }
        catch (error) {
            this.logger.error(`Failed to create Salesforce quotation: ${error.message}`);
        }
        try {
            await this.sendQuotationEmail(quotation, pdfBuffer);
            this.logger.log(`Quotation email sent to ${quotation.user.email}`);
        }
        catch (error) {
            this.logger.error(`Failed to send quotation email: ${error.message}`);
        }
        return {
            id: quotation.id,
            salesforceQuoteId: sfQuoteId,
            salesforceQuoteNumber: sfQuoteNumber,
            phase: client_1.QuotationPhase.SUBMITTED,
            projectName: quotation.projectName,
            estimatedPriceCents: calculation.estimatedPriceCents,
            kit: {
                id: quotation.kit.id,
                name: quotation.kit.name,
            },
        };
    }
    async createSalesforceQuotation(quotation, createDto) {
        const username = this.configService.get('SALESFORCE_USERNAME');
        const password = this.configService.get('SALESFORCE_PASSWORD');
        const securityToken = this.configService.get('SALESFORCE_SECURITY_TOKEN');
        if (!username || !password) {
            this.logger.warn('Salesforce credentials not configured, skipping SF creation');
            throw new Error('Salesforce not configured');
        }
        await this.sfConnection.login(username, password + (securityToken || ''));
        const sfData = {
            Partner__c: quotation.user.salesforceAccountId,
            Nome_Progetto__c: quotation.projectName,
            Budget_Cliente__c: quotation.customerBudgetCents
                ? quotation.customerBudgetCents / 100
                : null,
            Citta_Installazione__c: quotation.installationCity,
            Data_Consegna_Richiesta__c: quotation.requestedDeliveryDate,
            Connessione_Internet__c: quotation.internetConnection,
            Tipologia_di_Contenuti__c: quotation.contentType,
            Gestione_Contenuti__c: quotation.contentManagement,
            Sistema_Ancoraggio__c: quotation.anchoringSystem,
            Materiale_Sito_Installazione__c: quotation.anchoringMaterial,
            Categoria_Cliente__c: quotation.customerCategory,
            Software_Esistente__c: quotation.hasExistingSoftware,
            Necessita_Videorender__c: quotation.needsVideorender,
            Descrizione_Prodotti__c: quotation.productsDescription,
            Note_Commerciali__c: quotation.commercialNotes,
            Necessita_Sopralluogo__c: quotation.needsSiteSurvey,
            Configurazione_Tecnica__c: quotation.configurationJson,
            Fase__c: 'Bozza',
        };
        const result = (await this.sfConnection.sobject('Quotazione__c').create(sfData));
        if (!result.success) {
            throw new Error(`Salesforce creation failed: ${JSON.stringify(result.errors)}`);
        }
        const sfRecord = (await this.sfConnection
            .sobject('Quotazione__c')
            .findOne({ Id: result.id }, 'Name'));
        return {
            id: result.id,
            number: sfRecord?.Name || result.id,
        };
    }
    async sendQuotationEmail(quotation, pdfBuffer) {
        const templatePath = path.join(__dirname, 'templates', 'quote-email.html');
        const template = await fs.readFile(templatePath, 'utf-8');
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
        const templateData = {
            userName: `${quotation.user.firstName || ''} ${quotation.user.lastName || ''}`.trim() || 'Cliente',
            projectName: quotation.projectName,
            kitName: quotation.kit?.name || 'Kit',
            kitSize: `${(quotation.kit?.totalWidthMm / 1000).toFixed(1)}m x ${(quotation.kit?.totalHeightMm / 1000).toFixed(1)}m`,
            quoteNumber: quotation.salesforceQuoteNumber || 'DRAFT',
            createdAt: quotation.createdAt.toLocaleDateString('it-IT'),
            dashboardUrl: `${frontendUrl}/dashboard/quotes/${quotation.id}`,
        };
        const html = this.emailService.renderTemplate(template, templateData);
        await this.emailService.sendEmail({
            to: quotation.user.orderEmail || quotation.user.email,
            subject: `Preventivo LEDWall - ${quotation.projectName}`,
            html,
            attachments: [
                {
                    filename: `preventivo-${quotation.id}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });
    }
    formatEnum(value) {
        if (!value)
            return 'N/A';
        return String(value).replace(/_/g, ' ');
    }
};
exports.StandardConfiguratorService = StandardConfiguratorService;
exports.StandardConfiguratorService = StandardConfiguratorService = StandardConfiguratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pdf_service_1.PdfService,
        email_service_1.EmailService,
        config_1.ConfigService])
], StandardConfiguratorService);
//# sourceMappingURL=standard-configurator.service.js.map