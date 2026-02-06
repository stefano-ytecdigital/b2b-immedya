import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateKitDto,
  UpdateKitDto,
} from './dto';
import { ProductType } from '@prisma/client';

@Injectable()
export class CatalogService {
  private readonly logger = new Logger(CatalogService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  async getProducts(filters?: { type?: ProductType; outdoorCompatible?: boolean }) {
    const where: any = {};

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

  async getProductById(id: string) {
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
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async createProduct(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
    });

    this.logger.log(`Product created: ${product.name} (${product.id})`);
    return product;
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });

    this.logger.log(`Product updated: ${product.name} (${product.id})`);
    return product;
  }

  async deleteProduct(id: string) {
    // Check if product has modules
    const productWithCounts = await this.prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { modules: true, kits: true },
        },
      },
    });

    if (!productWithCounts) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    if (productWithCounts._count.modules > 0 || productWithCounts._count.kits > 0) {
      throw new BadRequestException(
        `Cannot delete product with associated modules (${productWithCounts._count.modules}) or kits (${productWithCounts._count.kits})`,
      );
    }

    await this.prisma.product.delete({
      where: { id },
    });

    this.logger.log(`Product deleted: ${id}`);
    return { message: 'Product deleted successfully' };
  }

  // ============================================================================
  // MODULES
  // ============================================================================

  async getModules(filters?: { productId?: string; pixelPitch?: number }) {
    const where: any = {};

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

  async getModuleById(id: string) {
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
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return module;
  }

  async createModule(createModuleDto: CreateModuleDto) {
    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: createModuleDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${createModuleDto.productId} not found`);
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

  async updateModule(id: string, updateModuleDto: UpdateModuleDto) {
    // If productId is being updated, verify it exists
    if (updateModuleDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updateModuleDto.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${updateModuleDto.productId} not found`);
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

  async deleteModule(id: string) {
    // Check if module is used in any kit
    const moduleWithKits = await this.prisma.module.findUnique({
      where: { id },
      include: {
        kits: true,
      },
    });

    if (!moduleWithKits) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    if (moduleWithKits.kits.length > 0) {
      throw new BadRequestException(
        `Cannot delete module used in ${moduleWithKits.kits.length} kit(s)`,
      );
    }

    await this.prisma.module.delete({
      where: { id },
    });

    this.logger.log(`Module deleted: ${id}`);
    return { message: 'Module deleted successfully' };
  }

  // ============================================================================
  // KITS
  // ============================================================================

  async getKits(filters?: { productId?: string; pixelPitch?: number; type?: ProductType }) {
    const where: any = {};

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

  async getKitById(id: string) {
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
      throw new NotFoundException(`Kit with ID ${id} not found`);
    }

    return kit;
  }

  async createKit(createKitDto: CreateKitDto) {
    const { modules: kitModules, ...kitData } = createKitDto;

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: kitData.productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${kitData.productId} not found`);
    }

    // Verify all modules exist
    const moduleIds = kitModules.map((m) => m.moduleId);
    const modules = await this.prisma.module.findMany({
      where: {
        id: { in: moduleIds },
      },
    });

    if (modules.length !== moduleIds.length) {
      throw new NotFoundException('One or more modules not found');
    }

    // Create kit with modules
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

  async updateKit(id: string, updateKitDto: UpdateKitDto) {
    // If productId is being updated, verify it exists
    if (updateKitDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updateKitDto.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${updateKitDto.productId} not found`);
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

  async deleteKit(id: string) {
    // Check if kit is used in any quotation
    const kitWithQuotations = await this.prisma.kit.findUnique({
      where: { id },
      include: {
        quotations: true,
      },
    });

    if (!kitWithQuotations) {
      throw new NotFoundException(`Kit with ID ${id} not found`);
    }

    if (kitWithQuotations.quotations.length > 0) {
      throw new BadRequestException(
        `Cannot delete kit used in ${kitWithQuotations.quotations.length} quotation(s)`,
      );
    }

    // Delete kit (modules association will be deleted automatically)
    await this.prisma.kit.delete({
      where: { id },
    });

    this.logger.log(`Kit deleted: ${id}`);
    return { message: 'Kit deleted successfully' };
  }
}
