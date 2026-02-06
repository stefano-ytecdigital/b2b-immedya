import { IsString, IsInt, IsOptional, IsDateString } from 'class-validator';

export class SalesforceQuotationWebhookDto {
  @IsString()
  salesforceQuoteId: string; // Salesforce record ID

  @IsString()
  @IsOptional()
  salesforceQuoteNumber?: string; // Auto-number Name field

  @IsString()
  phase: string; // Fase__c (Bozza, Inviato a YTEC, Preventivo Pronto, Chiuso)

  @IsInt()
  @IsOptional()
  totalCostCents?: number; // Pricing from Salesforce (in cents)

  @IsString()
  @IsOptional()
  ytecNotes?: string; // Note_Riservato_a_YTEC__c

  @IsDateString()
  lastModifiedDate: string; // SystemModstamp (for idempotency)
}
