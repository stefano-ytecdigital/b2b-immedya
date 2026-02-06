import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ProductType } from '@prisma/client';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsBoolean()
  outdoorCompatible: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  technicalSheetUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @IsBoolean()
  @IsOptional()
  outdoorCompatible?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  technicalSheetUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class ProductResponseDto {
  id: string;
  name: string;
  type: ProductType;
  outdoorCompatible: boolean;
  description?: string;
  technicalSheetUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    modules: number;
    kits: number;
  };
}
