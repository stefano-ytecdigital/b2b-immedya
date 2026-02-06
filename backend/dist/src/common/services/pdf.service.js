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
var PdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const puppeteer = __importStar(require("puppeteer"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let PdfService = PdfService_1 = class PdfService {
    configService;
    logger = new common_1.Logger(PdfService_1.name);
    constructor(configService) {
        this.configService = configService;
    }
    async generatePdf(html, options) {
        const timeout = this.configService.get('PDF_TIMEOUT', 30000);
        const headless = this.configService.get('PDF_HEADLESS', 'true') === 'true';
        let browser = null;
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
            page.setDefaultTimeout(timeout);
            await page.setContent(html, {
                waitUntil: 'networkidle0',
            });
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
        }
        catch (error) {
            this.logger.error(`PDF generation failed: ${error.message}`, error.stack);
            throw error;
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    renderTemplate(template, data) {
        let html = template;
        Object.keys(data).forEach((key) => {
            const value = data[key] ?? '';
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, this.escapeHtml(String(value)));
        });
        Object.keys(data).forEach((key) => {
            const value = data[key];
            const regex = new RegExp(`{{#${key}}}([\\s\\S]*?){{/${key}}}`, 'g');
            if (value) {
                html = html.replace(regex, '$1');
            }
            else {
                html = html.replace(regex, '');
            }
        });
        html = html.replace(/{{#(\w+)}}[\s\S]*?{{\/\1}}/g, (match, key) => {
            const value = data[key];
            if (Array.isArray(value) && value.length > 0) {
                return match;
            }
            return '';
        });
        return html;
    }
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };
        return text.replace(/[&<>"']/g, (char) => map[char]);
    }
    async loadTemplate(templatePath) {
        try {
            const fullPath = path.resolve(templatePath);
            const template = await fs.readFile(fullPath, 'utf-8');
            return template;
        }
        catch (error) {
            this.logger.error(`Failed to load template ${templatePath}: ${error.message}`);
            throw error;
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PdfService);
//# sourceMappingURL=pdf.service.js.map