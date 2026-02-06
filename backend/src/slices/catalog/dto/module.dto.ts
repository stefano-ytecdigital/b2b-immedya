import { IsString, IsNumber, IsInt, Min } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsString()
  productId: string;

  @IsInt()
  @Min(1)
  widthMm: number;

  @IsInt()
  @Min(1)
  heightMm: number;

  @IsNumber()
  @Min(0)
  pixelPitch: number;

  @IsInt()
  @Min(1)
  resolutionWidth: number;

  @IsInt()
  @Min(1)
  resolutionHeight: number;

  @IsInt()
  @Min(0)
  powerConsumptionW: number;

  @IsNumber()
  @Min(0)
  weightKg: number;

  @IsInt()
  @Min(0)
  maxPixelsPerCard?: number;

  @IsInt()
  @Min(0)
  unitPriceCents: number;
}

export class UpdateModuleDto {
  @IsString()
  name?: string;

  @IsString()
  productId?: string;

  @IsInt()
  @Min(1)
  widthMm?: number;

  @IsInt()
  @Min(1)
  heightMm?: number;

  @IsNumber()
  @Min(0)
  pixelPitch?: number;

  @IsInt()
  @Min(1)
  resolutionWidth?: number;

  @IsInt()
  @Min(1)
  resolutionHeight?: number;

  @IsInt()
  @Min(0)
  powerConsumptionW?: number;

  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsInt()
  @Min(0)
  maxPixelsPerCard?: number;

  @IsInt()
  @Min(0)
  unitPriceCents?: number;
}

export class ModuleResponseDto {
  id: string;
  name: string;
  productId: string;
  widthMm: number;
  heightMm: number;
  pixelPitch: number;
  resolutionWidth: number;
  resolutionHeight: number;
  powerConsumptionW: number;
  weightKg: number;
  maxPixelsPerCard?: number;
  unitPriceCents: number;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    name: string;
    type: string;
  };
}
