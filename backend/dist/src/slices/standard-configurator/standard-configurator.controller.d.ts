import type { Response } from 'express';
import { StandardConfiguratorService } from './standard-configurator.service';
import { CalculateQuoteDto, CreateQuotationDto } from './dto';
export declare class StandardConfiguratorController {
    private readonly configuratorService;
    private readonly logger;
    constructor(configuratorService: StandardConfiguratorService);
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
    generatePdf(userId: string, createDto: CreateQuotationDto, res: Response): Promise<void>;
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
}
