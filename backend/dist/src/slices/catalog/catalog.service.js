"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CatalogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
let CatalogService = CatalogService_1 = class CatalogService {
    prisma;
    logger = new common_1.Logger(CatalogService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProducts(filters) {
        const where = {};
        if (filters?.type) {
            where.type = filters.type;
        }
        if (filters?.outdoorCompatible !== undefined) {
            where.outdoorCompatible = filters.outdoorCompatible;
        }
        const products = await this.prisma.product.findMany({
            where,
            include: {
                _count: {
                    select: {
                        modules: true,
                        kits: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        this.logger.log(`Found ${products.length} products`);
        return products;
    }
    async getProductById(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                modules: {
                    select: {
                        id: true,
                        name: true,
                        pixelPitch: true,
                        unitPriceCents: true,
                    },
                    orderBy: { pixelPitch: 'asc' },
                },
                kits: {
                    select: {
                        id: true,
                        name: true,
                        totalPriceCents: true,
                    },
                    orderBy: { name: 'asc' },
                },
                _count: {
                    select: {
                        modules: true,
                        kits: true,
                    },
                },
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        return product;
    }
    async createProduct(createProductDto) {
        const product = await this.prisma.product.create({
            data: createProductDto,
        });
        this.logger.log(`Product created: ${product.name} (${product.id})`);
        return product;
    }
    async updateProduct(id, updateProductDto) {
        const product = await this.prisma.product.update({
            where: { id },
            data: updateProductDto,
        });
        this.logger.log(`Product updated: ${product.name} (${product.id})`);
        return product;
    }
    async deleteProduct(id) {
        const productWithCounts = await this.prisma.product.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { modules: true, kits: true },
                },
            },
        });
        if (!productWithCounts) {
            throw new common_1.NotFoundException(`Product with ID ${id} not found`);
        }
        if (productWithCounts._count.modules > 0 || productWithCounts._count.kits > 0) {
            throw new common_1.BadRequestException(`Cannot delete product with associated modules (${productWithCounts._count.modules}) or kits (${productWithCounts._count.kits})`);
        }
        await this.prisma.product.delete({
            where: { id },
        });
        this.logger.log(`Product deleted: ${id}`);
        return { message: 'Product deleted successfully' };
    }
    async getModules(filters) {
        const where = {};
        if (filters?.productId) {
            where.productId = filters.productId;
        }
        if (filters?.pixelPitch) {
            where.pixelPitch = filters.pixelPitch;
        }
        const modules = await this.prisma.module.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: [{ productId: 'asc' }, { pixelPitch: 'asc' }],
        });
        this.logger.log(`Found ${modules.length} modules`);
        return modules;
    }
    async getModuleById(id) {
        const module = await this.prisma.module.findUnique({
            where: { id },
            include: {
                product: true,
                kits: {
                    include: {
                        kit: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!module) {
            throw new common_1.NotFoundException(`Module with ID ${id} not found`);
        }
        return module;
    }
    async createModule(createModuleDto) {
        const product = await this.prisma.product.findUnique({
            where: { id: createModuleDto.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${createModuleDto.productId} not found`);
        }
        const module = await this.prisma.module.create({
            data: createModuleDto,
            include: {
                product: true,
            },
        });
        this.logger.log(`Module created: ${module.name} (${module.id})`);
        return module;
    }
    async updateModule(id, updateModuleDto) {
        if (updateModuleDto.productId) {
            const product = await this.prisma.product.findUnique({
                where: { id: updateModuleDto.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${updateModuleDto.productId} not found`);
            }
        }
        const module = await this.prisma.module.update({
            where: { id },
            data: updateModuleDto,
            include: {
                product: true,
            },
        });
        this.logger.log(`Module updated: ${module.name} (${module.id})`);
        return module;
    }
    async deleteModule(id) {
        const moduleWithKits = await this.prisma.module.findUnique({
            where: { id },
            include: {
                kits: true,
            },
        });
        if (!moduleWithKits) {
            throw new common_1.NotFoundException(`Module with ID ${id} not found`);
        }
        if (moduleWithKits.kits.length > 0) {
            throw new common_1.BadRequestException(`Cannot delete module used in ${moduleWithKits.kits.length} kit(s)`);
        }
        await this.prisma.module.delete({
            where: { id },
        });
        this.logger.log(`Module deleted: ${id}`);
        return { message: 'Module deleted successfully' };
    }
    async getKits(filters) {
        const where = {};
        if (filters?.productId) {
            where.productId = filters.productId;
        }
        if (filters?.pixelPitch) {
            where.pixelPitch = filters.pixelPitch;
        }
        if (filters?.type) {
            where.product = {
                type: filters.type,
            };
        }
        const kits = await this.prisma.kit.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                modules: {
                    include: {
                        module: {
                            select: {
                                id: true,
                                name: true,
                                widthMm: true,
                                heightMm: true,
                                pixelPitch: true,
                            },
                        },
                    },
                },
            },
            orderBy: { name: 'asc' },
        });
        this.logger.log(`Found ${kits.length} kits`);
        return kits;
    }
    async getKitById(id) {
        const kit = await this.prisma.kit.findUnique({
            where: { id },
            include: {
                product: true,
                modules: {
                    include: {
                        module: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!kit) {
            throw new common_1.NotFoundException(`Kit with ID ${id} not found`);
        }
        return kit;
    }
    async createKit(createKitDto) {
        const { modules: kitModules, ...kitData } = createKitDto;
        const product = await this.prisma.product.findUnique({
            where: { id: kitData.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${kitData.productId} not found`);
        }
        const moduleIds = kitModules.map((m) => m.moduleId);
        const modules = await this.prisma.module.findMany({
            where: {
                id: { in: moduleIds },
            },
        });
        if (modules.length !== moduleIds.length) {
            throw new common_1.NotFoundException('One or more modules not found');
        }
        const kit = await this.prisma.kit.create({
            data: {
                ...kitData,
                modules: {
                    create: kitModules.map((km) => ({
                        moduleId: km.moduleId,
                        quantity: km.quantity,
                    })),
                },
            },
            include: {
                product: true,
                modules: {
                    include: {
                        module: true,
                    },
                },
            },
        });
        this.logger.log(`Kit created: ${kit.name} (${kit.id}) with ${kitModules.length} modules`);
        return kit;
    }
    async updateKit(id, updateKitDto) {
        if (updateKitDto.productId) {
            const product = await this.prisma.product.findUnique({
                where: { id: updateKitDto.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${updateKitDto.productId} not found`);
            }
        }
        const kit = await this.prisma.kit.update({
            where: { id },
            data: updateKitDto,
            include: {
                product: true,
                modules: {
                    include: {
                        module: true,
                    },
                },
            },
        });
        this.logger.log(`Kit updated: ${kit.name} (${kit.id})`);
        return kit;
    }
    async deleteKit(id) {
        const kitWithQuotations = await this.prisma.kit.findUnique({
            where: { id },
            include: {
                quotations: true,
            },
        });
        if (!kitWithQuotations) {
            throw new common_1.NotFoundException(`Kit with ID ${id} not found`);
        }
        if (kitWithQuotations.quotations.length > 0) {
            throw new common_1.BadRequestException(`Cannot delete kit used in ${kitWithQuotations.quotations.length} quotation(s)`);
        }
        await this.prisma.kit.delete({
            where: { id },
        });
        this.logger.log(`Kit deleted: ${id}`);
        return { message: 'Kit deleted successfully' };
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = CatalogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map