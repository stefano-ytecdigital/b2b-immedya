declare class KitModuleInput {
    moduleId: string;
    quantity: number;
}
export declare class CreateKitDto {
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
    modules: KitModuleInput[];
}
export declare class UpdateKitDto {
    name?: string;
    productId?: string;
    description?: string;
    imageUrl?: string;
    totalWidthMm?: number;
    totalHeightMm?: number;
    totalResolutionW?: number;
    totalResolutionH?: number;
    pixelPitch?: number;
    totalPriceCents?: number;
}
export declare class KitResponseDto {
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
export {};
