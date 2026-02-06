import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, CreateModuleDto, UpdateModuleDto, CreateKitDto, UpdateKitDto } from './dto';
import { ProductType } from '@prisma/client';
export declare class CatalogService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getProducts(filters?: {
        type?: ProductType;
        outdoorCompatible?: boolean;
    }): Promise<({
        _count: {
            modules: number;
            kits: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.ProductType;
        outdoorCompatible: boolean;
        description: string | null;
        technicalSheetUrl: string | null;
        imageUrl: string | null;
    })[]>;
    getProductById(id: string): Promise<{
        modules: {
            id: string;
            name: string;
            pixelPitch: number;
            unitPriceCents: number;
        }[];
        kits: {
            id: string;
            name: string;
            totalPriceCents: number;
        }[];
        _count: {
            modules: number;
            kits: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.ProductType;
        outdoorCompatible: boolean;
        description: string | null;
        technicalSheetUrl: string | null;
        imageUrl: string | null;
    }>;
    createProduct(createProductDto: CreateProductDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.ProductType;
        outdoorCompatible: boolean;
        description: string | null;
        technicalSheetUrl: string | null;
        imageUrl: string | null;
    }>;
    updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: import("@prisma/client").$Enums.ProductType;
        outdoorCompatible: boolean;
        description: string | null;
        technicalSheetUrl: string | null;
        imageUrl: string | null;
    }>;
    deleteProduct(id: string): Promise<{
        message: string;
    }>;
    getModules(filters?: {
        productId?: string;
        pixelPitch?: number;
    }): Promise<({
        product: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.ProductType;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        widthMm: number;
        heightMm: number;
        pixelPitch: number;
        resolutionWidth: number;
        resolutionHeight: number;
        powerConsumptionW: number;
        weightKg: number;
        maxPixelsPerCard: number | null;
        unitPriceCents: number;
        productId: string;
    })[]>;
    getModuleById(id: string): Promise<{
        kits: ({
            kit: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            quantity: number;
            moduleId: string;
            kitId: string;
        })[];
        product: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.ProductType;
            outdoorCompatible: boolean;
            description: string | null;
            technicalSheetUrl: string | null;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        widthMm: number;
        heightMm: number;
        pixelPitch: number;
        resolutionWidth: number;
        resolutionHeight: number;
        powerConsumptionW: number;
        weightKg: number;
        maxPixelsPerCard: number | null;
        unitPriceCents: number;
        productId: string;
    }>;
    createModule(createModuleDto: CreateModuleDto): Promise<{
        product: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.ProductType;
            outdoorCompatible: boolean;
            description: string | null;
            technicalSheetUrl: string | null;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        widthMm: number;
        heightMm: number;
        pixelPitch: number;
        resolutionWidth: number;
        resolutionHeight: number;
        powerConsumptionW: number;
        weightKg: number;
        maxPixelsPerCard: number | null;
        unitPriceCents: number;
        productId: string;
    }>;
    updateModule(id: string, updateModuleDto: UpdateModuleDto): Promise<{
        product: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.ProductType;
            outdoorCompatible: boolean;
            description: string | null;
            technicalSheetUrl: string | null;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        widthMm: number;
        heightMm: number;
        pixelPitch: number;
        resolutionWidth: number;
        resolutionHeight: number;
        powerConsumptionW: number;
        weightKg: number;
        maxPixelsPerCard: number | null;
        unitPriceCents: number;
        productId: string;
    }>;
    deleteModule(id: string): Promise<{
        message: string;
    }>;
    getKits(filters?: {
        productId?: string;
        pixelPitch?: number;
        type?: ProductType;
    }): Promise<({
        modules: ({
            module: {
                id: string;
                name: string;
                widthMm: number;
                heightMm: number;
                pixelPitch: number;
            };
        } & {
            id: string;
            quantity: number;
            moduleId: string;
            kitId: string;
        })[];
        product: {
            id: string;
            name: string;
            type: import("@prisma/client").$Enums.ProductType;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        imageUrl: string | null;
        pixelPitch: number;
        productId: string;
        totalWidthMm: number;
        totalHeightMm: number;
        totalResolutionW: number;
        totalResolutionH: number;
        totalPriceCents: number;
    })[]>;
    getKitById(id: string): Promise<{
        modules: ({
            module: {
                product: {
                    id: string;
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                widthMm: number;
                heightMm: number;
                pixelPitch: number;
                resolutionWidth: number;
                resolutionHeight: number;
                powerConsumptionW: number;
                weightKg: number;
                maxPixelsPerCard: number | null;
                unitPriceCents: number;
                productId: string;
            };
        } & {
            id: string;
            quantity: number;
            moduleId: string;
            kitId: string;
        })[];
        product: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.ProductType;
            outdoorCompatible: boolean;
            description: string | null;
            technicalSheetUrl: string | null;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        imageUrl: string | null;
        pixelPitch: number;
        productId: string;
        totalWidthMm: number;
        totalHeightMm: number;
        totalResolutionW: number;
        totalResolutionH: number;
        totalPriceCents: number;
    }>;
    createKit(createKitDto: CreateKitDto): Promise<{
        modules: ({
            module: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                widthMm: number;
                heightMm: number;
                pixelPitch: number;
                resolutionWidth: number;
                resolutionHeight: number;
                powerConsumptionW: number;
                weightKg: number;
                maxPixelsPerCard: number | null;
                unitPriceCents: number;
                productId: string;
            };
        } & {
            id: string;
            quantity: number;
            moduleId: string;
            kitId: string;
        })[];
        product: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.ProductType;
            outdoorCompatible: boolean;
            description: string | null;
            technicalSheetUrl: string | null;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        imageUrl: string | null;
        pixelPitch: number;
        productId: string;
        totalWidthMm: number;
        totalHeightMm: number;
        totalResolutionW: number;
        totalResolutionH: number;
        totalPriceCents: number;
    }>;
    updateKit(id: string, updateKitDto: UpdateKitDto): Promise<{
        modules: ({
            module: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                widthMm: number;
                heightMm: number;
                pixelPitch: number;
                resolutionWidth: number;
                resolutionHeight: number;
                powerConsumptionW: number;
                weightKg: number;
                maxPixelsPerCard: number | null;
                unitPriceCents: number;
                productId: string;
            };
        } & {
            id: string;
            quantity: number;
            moduleId: string;
            kitId: string;
        })[];
        product: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.ProductType;
            outdoorCompatible: boolean;
            description: string | null;
            technicalSheetUrl: string | null;
            imageUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        imageUrl: string | null;
        pixelPitch: number;
        productId: string;
        totalWidthMm: number;
        totalHeightMm: number;
        totalResolutionW: number;
        totalResolutionH: number;
        totalPriceCents: number;
    }>;
    deleteKit(id: string): Promise<{
        message: string;
    }>;
}
