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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CatalogController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const catalog_service_1 = require("./catalog.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("./guards/roles.guard");
const roles_decorator_1 = require("./decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const client_1 = require("@prisma/client");
const dto_1 = require("./dto");
let CatalogController = CatalogController_1 = class CatalogController {
    catalogService;
    logger = new common_1.Logger(CatalogController_1.name);
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    async getProducts(type, outdoorCompatible) {
        const filters = {};
        if (type) {
            filters.type = type;
        }
        if (outdoorCompatible !== undefined) {
            filters.outdoorCompatible = outdoorCompatible === 'true';
        }
        return this.catalogService.getProducts(filters);
    }
    async getProductById(id) {
        return this.catalogService.getProductById(id);
    }
    async createProduct(createProductDto) {
        this.logger.log(`Creating product: ${createProductDto.name}`);
        return this.catalogService.createProduct(createProductDto);
    }
    async updateProduct(id, updateProductDto) {
        this.logger.log(`Updating product: ${id}`);
        return this.catalogService.updateProduct(id, updateProductDto);
    }
    async deleteProduct(id) {
        this.logger.log(`Deleting product: ${id}`);
        await this.catalogService.deleteProduct(id);
    }
    async getModules(productId, pixelPitch) {
        const filters = {};
        if (productId) {
            filters.productId = productId;
        }
        if (pixelPitch) {
            filters.pixelPitch = parseFloat(pixelPitch);
        }
        return this.catalogService.getModules(filters);
    }
    async getModuleById(id) {
        return this.catalogService.getModuleById(id);
    }
    async createModule(createModuleDto) {
        this.logger.log(`Creating module: ${createModuleDto.name}`);
        return this.catalogService.createModule(createModuleDto);
    }
    async updateModule(id, updateModuleDto) {
        this.logger.log(`Updating module: ${id}`);
        return this.catalogService.updateModule(id, updateModuleDto);
    }
    async deleteModule(id) {
        this.logger.log(`Deleting module: ${id}`);
        await this.catalogService.deleteModule(id);
    }
    async getKits(productId, pixelPitch, type) {
        const filters = {};
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
    async getKitById(id) {
        return this.catalogService.getKitById(id);
    }
    async createKit(createKitDto) {
        this.logger.log(`Creating kit: ${createKitDto.name}`);
        return this.catalogService.createKit(createKitDto);
    }
    async updateKit(id, updateKitDto) {
        this.logger.log(`Updating kit: ${id}`);
        return this.catalogService.updateKit(id, updateKitDto);
    }
    async deleteKit(id) {
        this.logger.log(`Deleting kit: ${id}`);
        await this.catalogService.deleteKit(id);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('products'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('outdoorCompatible')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getProducts", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getProductById", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateProductDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createProduct", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Put)('products/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateProductDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateProduct", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Delete)('products/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteProduct", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('modules'),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('pixelPitch')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getModules", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('modules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getModuleById", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Post)('modules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateModuleDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createModule", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Put)('modules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateModuleDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateModule", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Delete)('modules/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteModule", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('kits'),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('pixelPitch')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getKits", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('kits/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getKitById", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Post)('kits'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateKitDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "createKit", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Put)('kits/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateKitDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "updateKit", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN),
    (0, common_1.Delete)('kits/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "deleteKit", null);
exports.CatalogController = CatalogController = CatalogController_1 = __decorate([
    (0, common_1.Controller)('catalog'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map