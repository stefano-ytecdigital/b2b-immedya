import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

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

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const secure = this.configService.get<string>('SMTP_SECURE', 'false') === 'true';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    if (!host || !user || !pass) {
      this.logger.warn('SMTP credentials not configured, email sending disabled');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });

      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize email transporter: ${error.message}`);
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured, skipping email send');
      return;
    }

    const from = this.configService.get<string>('EMAIL_FROM', 'noreply@immedya.com');

    try {
      const info = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      this.logger.log(`Email sent successfully to ${options.to}: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Render email template with data
   */
  renderTemplate(template: string, data: Record<string, any>): string {
    let html = template;

    Object.keys(data).forEach((key) => {
      const value = data[key] ?? '';
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, String(value));
    });

    return html;
  }
}
