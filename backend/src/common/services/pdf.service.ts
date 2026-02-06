import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Generate PDF from HTML template
   */
  async generatePdf(html: string, options?: { filename?: string }): Promise<Buffer> {
    const timeout = this.configService.get<number>('PDF_TIMEOUT', 30000);
    const headless = this.configService.get<string>('PDF_HEADLESS', 'true') === 'true';

    let browser: puppeteer.Browser | null = null;

    try {
      this.logger.log('Launching browser for PDF generation...');

      browser = await puppeteer.launch({
        headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      // Set timeout
      page.setDefaultTimeout(timeout);

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      this.logger.log(`PDF generated successfully (${pdfBuffer.length} bytes)`);

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`PDF generation failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Render template with data (basic Mustache-like replacement)
   */
  renderTemplate(template: string, data: Record<string, any>): string {
    let html = template;

    // Simple variable replacement: {{variable}}
    Object.keys(data).forEach((key) => {
      const value = data[key] ?? '';
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, this.escapeHtml(String(value)));
    });

    // Conditional sections: {{#key}}...{{/key}}
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const regex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');

      if (value) {
        // Keep section
        html = html.replace(regex, '$1');
      } else {
        // Remove section
        html = html.replace(regex, '');
      }
    });

    // Array iteration: {{#items}}...{{/items}}
    // Simplified: just removes the section if array is empty
    html = html.replace(/{{#(\w+)}}[\s\S]*?{{\/\1}}/g, (match, key) => {
      const value = data[key];
      if (Array.isArray(value) && value.length > 0) {
        return match; // Keep for now (full implementation would iterate)
      }
      return '';
    });

    return html;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Load template from file
   */
  async loadTemplate(templatePath: string): Promise<string> {
    try {
      const fullPath = path.resolve(templatePath);
      const template = await fs.readFile(fullPath, 'utf-8');
      return template;
    } catch (error) {
      this.logger.error(`Failed to load template ${templatePath}: ${error.message}`);
      throw error;
    }
  }
}
