import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../../common/services/email.service';
import { SalesforceQuotationWebhookDto } from './dto/salesforce-webhook.dto';
import { QuotationPhase } from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Verify Salesforce webhook signature
   *
   * Salesforce signs webhooks with HMAC-SHA256
   * Header: x-salesforce-signature = base64(hmac-sha256(secret, body))
   */
  async verifySalesforceSignature(
    webhookData: SalesforceQuotationWebhookDto,
    receivedSignature?: string,
  ): Promise<boolean> {
    const webhookSecret = this.configService.get<string>('SALESFORCE_WEBHOOK_SECRET');

    // If no secret configured, allow in development only
    if (!webhookSecret) {
      const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
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

    // Calculate expected signature
    const payload = JSON.stringify(webhookData);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('base64');

    // Compare signatures (constant-time comparison)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature),
    );

    if (!isValid) {
      this.logger.warn(`Signature mismatch. Expected: ${expectedSignature}, Received: ${receivedSignature}`);
    }

    return isValid;
  }

  /**
   * Check if webhook was already processed (idempotency)
   */
  async checkIdempotency(salesforceQuoteId: string, lastModifiedDate: string): Promise<boolean> {
    const quotation = await this.prisma.quotation.findUnique({
      where: { salesforceQuoteId },
      select: { lastSyncAt: true },
    });

    if (!quotation) {
      return false; // New quotation
    }

    if (!quotation.lastSyncAt) {
      return false; // Never synced
    }

    const lastSync = quotation.lastSyncAt.toISOString();
    const webhookTimestamp = new Date(lastModifiedDate).toISOString();

    // If lastSyncAt >= webhookTimestamp, already processed
    return lastSync >= webhookTimestamp;
  }

  /**
   * Process quotation update from Salesforce
   */
  async processQuotationUpdate(webhookData: SalesforceQuotationWebhookDto) {
    const { salesforceQuoteId, salesforceQuoteNumber, phase, totalCostCents, ytecNotes } =
      webhookData;

    // Find quotation by Salesforce ID
    const quotation = await this.prisma.quotation.findUnique({
      where: { salesforceQuoteId },
      include: {
        user: true,
        kit: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with SF ID ${salesforceQuoteId} not found`);
    }

    const oldPhase = quotation.phase;

    // Map Salesforce phase to enum
    const newPhase = this.mapSalesforcePhase(phase);

    // Update quotation
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

    this.logger.log(
      `Quotation ${quotation.id} updated: ${oldPhase} → ${newPhase}, cost: €${(totalCostCents || 0) / 100}`,
    );

    // Send email if phase changed
    let emailSent = false;
    if (oldPhase !== newPhase && this.shouldNotifyPhaseChange(oldPhase, newPhase)) {
      try {
        await this.sendPhaseChangeEmail(quotation, oldPhase, newPhase);
        emailSent = true;
        this.logger.log(`Phase change email sent to ${quotation.user.email}`);
      } catch (error) {
        this.logger.error(`Failed to send phase change email: ${error.message}`);
        // Continue anyway
      }
    }

    return {
      quotationId: quotation.id,
      oldPhase,
      newPhase,
      emailSent,
    };
  }

  /**
   * Map Salesforce phase string to QuotationPhase enum
   */
  private mapSalesforcePhase(sfPhase: string): QuotationPhase {
    const phaseMap: Record<string, QuotationPhase> = {
      'Bozza': QuotationPhase.DRAFT,
      'Inviato a YTEC': QuotationPhase.SUBMITTED,
      'Preventivo Pronto': QuotationPhase.READY,
      'Chiuso': QuotationPhase.CLOSED,
    };

    return phaseMap[sfPhase] || QuotationPhase.DRAFT;
  }

  /**
   * Determine if partner should be notified of phase change
   */
  private shouldNotifyPhaseChange(oldPhase: QuotationPhase, newPhase: QuotationPhase): boolean {
    // Notify on these transitions:
    // - SUBMITTED → READY (preventivo pronto)
    // - READY → CLOSED (ordine confermato)
    // - Any → DRAFT (unlikely, but notify anyway)

    const notifyTransitions = [
      [QuotationPhase.SUBMITTED, QuotationPhase.READY],
      [QuotationPhase.READY, QuotationPhase.CLOSED],
    ];

    return notifyTransitions.some(([from, to]) => oldPhase === from && newPhase === to);
  }

  /**
   * Send phase change notification email
   */
  private async sendPhaseChangeEmail(
    quotation: any,
    oldPhase: QuotationPhase,
    newPhase: QuotationPhase,
  ) {
    const templatePath = path.join(__dirname, 'templates', 'phase-change-email.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

    const phaseMessages: Record<QuotationPhase, string> = {
      [QuotationPhase.DRAFT]: 'In lavorazione',
      [QuotationPhase.SUBMITTED]: 'Inviato al team YTEC',
      [QuotationPhase.READY]: 'Preventivo Pronto! 🎉',
      [QuotationPhase.CLOSED]: 'Chiuso',
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
}
