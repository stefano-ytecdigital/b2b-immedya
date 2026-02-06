import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';
import {
  InternetConnection,
  ContentType,
  ContentManagement,
  AnchoringSystem,
  AnchoringMaterial,
  CustomerCategory,
} from '@prisma/client';

export class CalculateQuoteDto {
  @IsString()
  kitId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateQuotationDto {
  @IsString()
  kitId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  // Project info
  @IsString()
  projectName: string;

  @IsInt()
  @IsOptional()
  customerBudgetCents?: number;

  @IsString()
  @IsOptional()
  installationCity?: string;

  @IsDateString()
  @IsOptional()
  requestedDeliveryDate?: string;

  // Installation details
  @IsEnum(InternetConnection)
  @IsOptional()
  internetConnection?: InternetConnection;

  @IsEnum(ContentType)
  @IsOptional()
  contentType?: ContentType;

  @IsEnum(ContentManagement)
  @IsOptional()
  contentManagement?: ContentManagement;

  @IsEnum(AnchoringSystem)
  @IsOptional()
  anchoringSystem?: AnchoringSystem;

  @IsEnum(AnchoringMaterial)
  @IsOptional()
  anchoringMaterial?: AnchoringMaterial;

  // Customer info
  @IsEnum(CustomerCategory)
  @IsOptional()
  customerCategory?: CustomerCategory;

  @IsBoolean()
  @IsOptional()
  hasExistingSoftware?: boolean;

  @IsBoolean()
  @IsOptional()
  needsVideorender?: boolean;

  // Notes
  @IsString()
  @IsOptional()
  productsDescription?: string;

  @IsString()
  @IsOptional()
  commercialNotes?: string;

  @IsBoolean()
  @IsOptional()
  needsSiteSurvey?: boolean;
}

export class QuotationResponseDto {
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
