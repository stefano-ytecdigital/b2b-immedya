import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PdfService } from '../../common/services/pdf.service';
import { EmailService } from '../../common/services/email.service';
import { CalculateQuoteDto, CreateQuotationDto } from './dto';
import { QuotationPhase } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as jsforce from 'jsforce';

@Injectable()
export class StandardConfiguratorService {
  private readonly logger = new Logger(StandardConfiguratorService.name);
  private sfConnection: jsforce.Connection;

  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.initializeSalesforceConnection();
  }

  private initializeSalesforceConnection() {
    this.sfConnection = new jsforce.Connection({
      loginUrl: this.configService.get<string>('SALESFORCE_LOGIN_URL', 'https://login.salesforce.com'),
    });
  }

  /**
   * Calculate and validate quotation
   */
  async calculateQuote(userId: string, calculateDto: CalculateQuoteDto) {
    const { kitId, quantity } = calculateDto;

    // Get kit with full details
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
      throw new NotFoundException(`Kit with ID ${kitId} not found`);
    }

    // Calculate totals
    const totalPriceCents = kit.totalPriceCents * quantity;
    const totalWidthMm = kit.totalWidthMm;
    const totalHeightMm = kit.totalHeightMm;
    const totalResolutionW = kit.totalResolutionW * quantity;
    const totalResolutionH = kit.totalResolutionH;

    // Calculate power consumption
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

  /**
   * Generate PDF quotation
   */
  async generateQuotePdf(userId: string, createDto: CreateQuotationDto): Promise<Buffer> {
    const calculation = await this.calculateQuote(userId, {
      kitId: createDto.kitId,
      quantity: createDto.quantity,
    });

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Load PDF template
    const templatePath = path.join(__dirname, 'templates', 'quote-pdf.html');
    const template = await this.pdfService.loadTemplate(templatePath);

    // Prepare template data
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

    // Render HTML
    const html = this.pdfService.renderTemplate(template, templateData);

    // Generate PDF
    const pdfBuffer = await this.pdfService.generatePdf(html);

    this.logger.log(`PDF generated for ${createDto.projectName}`);

    return pdfBuffer;
  }

  /**
   * Create and confirm quotation (save DB + create SF + send email)
   */
  async confirmQuotation(userId: string, createDto: CreateQuotationDto) {
    this.logger.log(`Confirming quotation for user ${userId}, project: ${createDto.projectName}`);

    // 1. Calculate quote
    const calculation = await this.calculateQuote(userId, {
      kitId: createDto.kitId,
      quantity: createDto.quantity,
    });

    // 2. Generate PDF
    const pdfBuffer = await this.generateQuotePdf(userId, createDto);

    // 3. Save quotation in database (DRAFT)
    const quotation = await this.prisma.quotation.create({
      data: {
        userId,
        kitId: createDto.kitId,
        phase: QuotationPhase.DRAFT,
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

    // 4. Create quotation in Salesforce
    let sfQuoteId: string | undefined;
    let sfQuoteNumber: string | undefined;

    try {
      const sfResult = await this.createSalesforceQuotation(quotation, createDto);
      sfQuoteId = sfResult.id;
      sfQuoteNumber = sfResult.number;

      // Update quotation with SF info
      await this.prisma.quotation.update({
        where: { id: quotation.id },
        data: {
          salesforceQuoteId: sfQuoteId,
          salesforceQuoteNumber: sfQuoteNumber,
          phase: QuotationPhase.SUBMITTED,
          lastSyncAt: new Date(),
        },
      });

      this.logger.log(`Quotation synced to Salesforce: ${sfQuoteNumber}`);
    } catch (error) {
      this.logger.error(`Failed to create Salesforce quotation: ${error.message}`);
      // Continue anyway - quotation is saved locally
    }

    // 5. Send email with PDF attachment
    try {
      await this.sendQuotationEmail(quotation, pdfBuffer);
      this.logger.log(`Quotation email sent to ${quotation.user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send quotation email: ${error.message}`);
      // Continue anyway
    }

    return {
      id: quotation.id,
      salesforceQuoteId: sfQuoteId,
      salesforceQuoteNumber: sfQuoteNumber,
      phase: QuotationPhase.SUBMITTED,
      projectName: quotation.projectName,
      estimatedPriceCents: calculation.estimatedPriceCents,
      kit: {
        id: quotation.kit!.id,
        name: quotation.kit!.name,
      },
    };
  }

  /**
   * Create quotation in Salesforce
   */
  private async createSalesforceQuotation(quotation: any, createDto: CreateQuotationDto) {
    const username = this.configService.get<string>('SALESFORCE_USERNAME');
    const password = this.configService.get<string>('SALESFORCE_PASSWORD');
    const securityToken = this.configService.get<string>('SALESFORCE_SECURITY_TOKEN');

    if (!username || !password) {
      this.logger.warn('Salesforce credentials not configured, skipping SF creation');
      throw new Error('Salesforce not configured');
    }

    // Login to Salesforce
    await this.sfConnection.login(username, password + (securityToken || ''));

    // Create Quotazione__c record
    // Note: Field names are placeholders - adjust to actual SF object
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

    const result = (await this.sfConnection.sobject('Quotazione__c').create(sfData as any)) as any;

    if (!result.success) {
      throw new Error(`Salesforce creation failed: ${JSON.stringify(result.errors)}`);
    }

    // Get the created record to get auto-number
    const sfRecord = (await this.sfConnection
      .sobject('Quotazione__c')
      .findOne({ Id: result.id }, 'Name')) as any;

    return {
      id: result.id,
      number: sfRecord?.Name || result.id,
    };
  }

  /**
   * Send quotation email
   */
  private async sendQuotationEmail(quotation: any, pdfBuffer: Buffer) {
    const templatePath = path.join(__dirname, 'templates', 'quote-email.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

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

  /**
   * Format enum value for display
   */
  private formatEnum(value: any): string {
    if (!value) return 'N/A';
    return String(value).replace(/_/g, ' ');
  }
}
