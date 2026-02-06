import { InternetConnection, ContentType, ContentManagement, AnchoringSystem, AnchoringMaterial, CustomerCategory } from '@prisma/client';
export declare class CalculateQuoteDto {
    kitId: string;
    quantity: number;
}
export declare class CreateQuotationDto {
    kitId: string;
    quantity: number;
    projectName: string;
    customerBudgetCents?: number;
    installationCity?: string;
    requestedDeliveryDate?: string;
    internetConnection?: InternetConnection;
    contentType?: ContentType;
    contentManagement?: ContentManagement;
    anchoringSystem?: AnchoringSystem;
    anchoringMaterial?: AnchoringMaterial;
    customerCategory?: CustomerCategory;
    hasExistingSoftware?: boolean;
    needsVideorender?: boolean;
    productsDescription?: string;
    commercialNotes?: string;
    needsSiteSurvey?: boolean;
}
export declare class QuotationResponseDto {
    id: string;
    userId: string;
    kitId?: string;
    salesforceQuoteId?: string;
    salesforceQuoteNumber?: string;
    phase: string;
    projectName: string;
    totalCostCents?: number;
    pdfUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    kit?: {
        id: string;
        name: string;
        totalPriceCents: number;
    };
}
