import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole, ProductType } from '@prisma/client';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateKitDto,
  UpdateKitDto,
} from './dto';

@Controller('catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  private readonly logger = new Logger(CatalogController.name);

  constructor(private catalogService: CatalogService) {}

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  /**
   * GET /catalog/products
   * Get all products (public)
   */
  @Public()
  @Get('products')
  async getProducts(
    @Query('type') type?: ProductType,
    @Query('outdoorCompatible') outdoorCompatible?: string,
  ) {
    const filters: any = {};

    if (type) {
      filters.type = type;
    }

    if (outdoorCompatible !== undefined) {
      filters.outdoorCompatible = outdoorCompatible === 'true';
    }

    return this.catalogService.getProducts(filters);
  }

  /**
   * GET /catalog/products/:id
   * Get product by ID (public)
   */
  @Public()
  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }

  /**
   * POST /catalog/products
   * Create product (admin only)
   */
  @Roles(UserRole.ADMIN)
  @Post('products')
  async createProduct(@Body() createProductDto: CreateProductDto) {
    this.logger.log(`Creating product: ${createProductDto.name}`);
    return this.catalogService.createProduct(createProductDto);
  }

  /**
   * PUT /catalog/products/:id
   * Update product (admin only)
   */
  @Roles(UserRole.ADMIN)
  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    this.logger.log(`Updating product: ${id}`);
    return this.catalogService.updateProduct(id, updateProductDto);
  }

  /**
   * DELETE /catalog/products/:id
   * Delete product (admin only)
   */
  @Roles(UserRole.ADMIN)
  @Delete('products/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProduct(@Param('id') id: string) {
    this.logger.log(`Deleting product: ${id}`);
    await this.catalogService.deleteProduct(id);
  }

  // ============================================================================
  // MODULES
  // ============================================================================

  /**
   * GET /catalog/modules
   * Get all modules (public)
   */
  @Public()
  @Get('modules')
  async getModules(
    @Query('productId') productId?: string,
    @Query('pixelPitch') pixelPitch?: string,
  ) {
    const filters: any = {};

    if (productId) {
      filters.productId = productId;
    }

    if (pixelPitch) {
      filters.pixelPitch = parseFloat(pixelPitch);
    }

    return this.catalogService.getModules(filters);
  }

  /**
   * GET /catalog/modules/:id
   * Get module by ID (public)
   */
  @Public()
  @Get('modules/:id')
  async getModuleById(@Param('id') id: string) {
    return this.catalogService.getModuleById(id);
  }

  /**
   * POST /catalog/modules
   * Create module (admin only)
   */
  @Roles(UserRole.ADMIN)
  @Post('modules')
  async createModule(@Body() createModuleDto: CreateModuleDto) {
    this.logger.log(`Creating module: ${createModuleDto.name}`);
    return this.catalogService.createModule(createModuleDto);
  }

  /**
   * PUT /catalog/modules/:id
   * Update module (admin only)
   */
  @Roles(UserRole.ADMIN)
  @Put('modules/:id')
  async updateModule(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    this.logger.log(`Updating module: ${id}`);
    return this.catalogService.updateModule(id, updateModuleDto);
  }

  /**
   * DELETE /catalog/modules/:id
   * Delete module (admin only)
   */
  @Roles(UserRole.ADMIN)
  @Delete('modules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModule(@Param('id') id: string) {
    this.logger.log(`Deleting module: ${id}`);
    await this.catalogService.deleteModule(id);
  }

  // ============================================================================
  // KITS
  // ============================================================================

  /**
   * GET /catalog/kits
   * Get all kits (public)
   */
  @Public()
  @Get('kits')
  async getKits(
    @Query('productId') productId?: string,
    @Query('pixelPitch') pixelPitch?: string,
    @Query('type') type?: ProductType,
  ) {
    const filters: any = {};

    if (productId) {
      filters.productId = productId;
    }

    if (pixelPitch) {
      filters.pixelPitch = parseFloat(pixelPitch);
    }

    if (type) {
      filters.type = type;
    }

    return this.catalogService.getKits(filters);
  }

  /**
   * GET /catalog/kits/:id
   * Get kit by ID with full details (public)
   */
  @Public()
  @Get('kits/:id')
  async getKitById(@Param('id') id: string) {
    return this.catalogService.getKitById(id);
  }

  /**
   * POST /catalog/kits
   * Create kit (admin only)
   */
  @Roles(UserRole.ADMIN)
  @Post('kits')
  async createKit(@Body() createKitDto: CreateKitDto) {
    this.logger.log(`Creating kit: ${createKitDto.name}`);
    return this.catalogService.createKit(createKitDto);
  }

  /**
   * PUT /catalog/kits/:id
   * Update kit (admin only)
   */
  @Roles(UserRole.ADMIN)
  @Put('kits/:id')
  async updateKit(@Param('id') id: string, @Body() updateKitDto: UpdateKitDto) {
    this.logger.log(`Updating kit: ${id}`);
    return this.catalogService.updateKit(id, updateKitDto);
  }

  /**
   * DELETE /catalog/kits/:id
   * Delete kit (admin only)
   */
  @Roles(UserRole.ADMIN)
  @Delete('kits/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteKit(@Param('id') id: string) {
    this.logger.log(`Deleting kit: ${id}`);
    await this.catalogService.deleteKit(id);
  }
}
