import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { StandardConfiguratorService } from './standard-configurator.service';
import { CalculateQuoteDto, CreateQuotationDto } from './dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Standard Configurator')
@ApiBearerAuth()
@Controller('standard')
export class StandardConfiguratorController {
  private readonly logger = new Logger(StandardConfiguratorController.name);

  constructor(private readonly configuratorService: StandardConfiguratorService) {}

  /**
   * Calculate quotation (validation + pricing)
   */
  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate quotation',
    description: 'Validates kit configuration and returns estimated pricing',
  })
  async calculateQuote(
    @CurrentUser('id') userId: string,
    @Body() calculateDto: CalculateQuoteDto,
  ) {
    this.logger.log(`Calculating quote for user ${userId}, kit ${calculateDto.kitId}`);
    return this.configuratorService.calculateQuote(userId, calculateDto);
  }

  /**
   * Generate PDF preview (without saving)
   */
  @Post('quote/pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate PDF preview',
    description: 'Generates quotation PDF without saving to database or sending to Salesforce',
  })
  async generatePdf(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateQuotationDto,
    @Res() res: Response,
  ) {
    this.logger.log(`Generating PDF preview for user ${userId}, project ${createDto.projectName}`);

    const pdfBuffer = await this.configuratorService.generateQuotePdf(userId, createDto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="preventivo-${createDto.projectName}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  /**
   * Confirm quotation (save DB + create SF + send email)
   */
  @Post('quote/confirm')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Confirm quotation',
    description: 'Creates quotation in database, syncs to Salesforce, and sends confirmation email',
  })
  async confirmQuotation(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateQuotationDto,
  ) {
    this.logger.log(`Confirming quotation for user ${userId}, project ${createDto.projectName}`);
    return this.configuratorService.confirmQuotation(userId, createDto);
  }
}
