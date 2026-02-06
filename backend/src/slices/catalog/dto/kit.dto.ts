import { IsString, IsNumber, IsInt, IsArray, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class KitModuleInput {
  @IsString()
  moduleId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateKitDto {
  @IsString()
  name: string;

  @IsString()
  productId: string;

  @IsString()
  description?: string;

  @IsString()
  imageUrl?: string;

  @IsInt()
  @Min(1)
  totalWidthMm: number;

  @IsInt()
  @Min(1)
  totalHeightMm: number;

  @IsInt()
  @Min(1)
  totalResolutionW: number;

  @IsInt()
  @Min(1)
  totalResolutionH: number;

  @IsNumber()
  @Min(0)
  pixelPitch: number;

  @IsInt()
  @Min(0)
  totalPriceCents: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KitModuleInput)
  modules: KitModuleInput[];
}

export class UpdateKitDto {
  @IsString()
  name?: string;

  @IsString()
  productId?: string;

  @IsString()
  description?: string;

  @IsString()
  imageUrl?: string;

  @IsInt()
  @Min(1)
  totalWidthMm?: number;

  @IsInt()
  @Min(1)
  totalHeightMm?: number;

  @IsInt()
  @Min(1)
  totalResolutionW?: number;

  @IsInt()
  @Min(1)
  totalResolutionH?: number;

  @IsNumber()
  @Min(0)
  pixelPitch?: number;

  @IsInt()
  @Min(0)
  totalPriceCents?: number;
}

export class KitResponseDto {
  id: string;
  name: string;
  productId: string;
  description?: string;
  imageUrl?: string;
  totalWidthMm: number;
  totalHeightMm: number;
  totalResolutionW: number;
  totalResolutionH: number;
  pixelPitch: number;
  totalPriceCents: number;
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    name: string;
    type: string;
  };
  modules?: Array<{
    quantity: number;
    module: {
      id: string;
      name: string;
      widthMm: number;
      heightMm: number;
      pixelPitch: number;
      unitPriceCents: number;
    };
  }>;
}
