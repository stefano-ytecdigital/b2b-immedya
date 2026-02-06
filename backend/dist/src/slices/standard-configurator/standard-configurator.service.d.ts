import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PdfService } from '../../common/services/pdf.service';
import { EmailService } from '../../common/services/email.service';
import { CalculateQuoteDto, CreateQuotationDto } from './dto';
export declare class StandardConfiguratorService {
    private prisma;
    private pdfService;
    private emailService;
    private configService;
    private readonly logger;
    private sfConnection;
    constructor(prisma: PrismaService, pdfService: PdfService, emailService: EmailService, configService: ConfigService);
    private initializeSalesforceConnection;
    calculateQuote(userId: string, calculateDto: CalculateQuoteDto): Promise<{
        kit: {
            id: string;
            name: string;
            description: string | null;
        };
        quantity: number;
        dimensions: {
            widthMm: number;
            heightMm: number;
        };
        resolution: {
            width: number;
            height: number;
        };
        pixelPitch: number;
        estimatedPriceCents: number;
        estimatedPowerConsumptionW: number;
        modules: {
            name: string;
            quantity: number;
            dimensions: string;
            unitPriceCents: number;
        }[];
    }>;
    generateQuotePdf(userId: string, createDto: CreateQuotationDto): Promise<Buffer>;
    confirmQuotation(userId: string, createDto: CreateQuotationDto): Promise<{
        id: string;
        salesforceQuoteId: string | undefined;
        salesforceQuoteNumber: string | undefined;
        phase: "SUBMITTED";
        projectName: string;
        estimatedPriceCents: number;
        kit: {
            id: string;
            name: string;
        };
    }>;
    private createSalesforceQuotation;
    private sendQuotationEmail;
    private formatEnum;
}
