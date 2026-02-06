export declare class CreateModuleDto {
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
}
export declare class UpdateModuleDto {
    name?: string;
    productId?: string;
    widthMm?: number;
    heightMm?: number;
    pixelPitch?: number;
    resolutionWidth?: number;
    resolutionHeight?: number;
    powerConsumptionW?: number;
    weightKg?: number;
    maxPixelsPerCard?: number;
    unitPriceCents?: number;
}
export declare class ModuleResponseDto {
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
