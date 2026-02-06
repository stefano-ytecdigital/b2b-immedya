import { ProductType } from '@prisma/client';
export declare class CreateProductDto {
    name: string;
    type: ProductType;
    outdoorCompatible: boolean;
    description?: string;
    technicalSheetUrl?: string;
    imageUrl?: string;
}
export declare class UpdateProductDto {
    name?: string;
    type?: ProductType;
    outdoorCompatible?: boolean;
    description?: string;
    technicalSheetUrl?: string;
    imageUrl?: string;
}
export declare class ProductResponseDto {
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
