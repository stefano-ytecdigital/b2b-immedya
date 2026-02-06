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
var StandardConfiguratorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardConfiguratorController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const standard_configurator_service_1 = require("./standard-configurator.service");
const dto_1 = require("./dto");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let StandardConfiguratorController = StandardConfiguratorController_1 = class StandardConfiguratorController {
    configuratorService;
    logger = new common_1.Logger(StandardConfiguratorController_1.name);
    constructor(configuratorService) {
        this.configuratorService = configuratorService;
    }
    async calculateQuote(userId, calculateDto) {
        this.logger.log(`Calculating quote for user ${userId}, kit ${calculateDto.kitId}`);
        return this.configuratorService.calculateQuote(userId, calculateDto);
    }
    async generatePdf(userId, createDto, res) {
        this.logger.log(`Generating PDF preview for user ${userId}, project ${createDto.projectName}`);
        const pdfBuffer = await this.configuratorService.generateQuotePdf(userId, createDto);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="preventivo-${createDto.projectName}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
    }
    async confirmQuotation(userId, createDto) {
        this.logger.log(`Confirming quotation for user ${userId}, project ${createDto.projectName}`);
        return this.configuratorService.confirmQuotation(userId, createDto);
    }
};
exports.StandardConfiguratorController = StandardConfiguratorController;
__decorate([
    (0, common_1.Post)('calculate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Calculate quotation',
        description: 'Validates kit configuration and returns estimated pricing',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CalculateQuoteDto]),
    __metadata("design:returntype", Promise)
], StandardConfiguratorController.prototype, "calculateQuote", null);
__decorate([
    (0, common_1.Post)('quote/pdf'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Generate PDF preview',
        description: 'Generates quotation PDF without saving to database or sending to Salesforce',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateQuotationDto, Object]),
    __metadata("design:returntype", Promise)
], StandardConfiguratorController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Post)('quote/confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm quotation',
        description: 'Creates quotation in database, syncs to Salesforce, and sends confirmation email',
    }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateQuotationDto]),
    __metadata("design:returntype", Promise)
], StandardConfiguratorController.prototype, "confirmQuotation", null);
exports.StandardConfiguratorController = StandardConfiguratorController = StandardConfiguratorController_1 = __decorate([
    (0, swagger_1.ApiTags)('Standard Configurator'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('standard'),
    __metadata("design:paramtypes", [standard_configurator_service_1.StandardConfiguratorService])
], StandardConfiguratorController);
//# sourceMappingURL=standard-configurator.controller.js.map