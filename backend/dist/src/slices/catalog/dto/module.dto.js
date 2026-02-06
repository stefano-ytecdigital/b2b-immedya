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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleResponseDto = exports.UpdateModuleDto = exports.CreateModuleDto = void 0;
const class_validator_1 = require("class-validator");
class CreateModuleDto {
    name;
    productId;
    widthMm;
    heightMm;
    pixelPitch;
    resolutionWidth;
    resolutionHeight;
    powerConsumptionW;
    weightKg;
    maxPixelsPerCard;
    unitPriceCents;
}
exports.CreateModuleDto = CreateModuleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateModuleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateModuleDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "widthMm", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "heightMm", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "pixelPitch", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "resolutionWidth", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "resolutionHeight", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "powerConsumptionW", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "weightKg", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "maxPixelsPerCard", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateModuleDto.prototype, "unitPriceCents", void 0);
class UpdateModuleDto {
    name;
    productId;
    widthMm;
    heightMm;
    pixelPitch;
    resolutionWidth;
    resolutionHeight;
    powerConsumptionW;
    weightKg;
    maxPixelsPerCard;
    unitPriceCents;
}
exports.UpdateModuleDto = UpdateModuleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateModuleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateModuleDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateModuleDto.prototype, "widthMm", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateModuleDto.prototype, "heightMm", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateModuleDto.prototype, "pixelPitch", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateModuleDto.prototype, "resolutionWidth", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateModuleDto.prototype, "resolutionHeight", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateModuleDto.prototype, "powerConsumptionW", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateModuleDto.prototype, "weightKg", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateModuleDto.prototype, "maxPixelsPerCard", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateModuleDto.prototype, "unitPriceCents", void 0);
class ModuleResponseDto {
    id;
    name;
    productId;
    widthMm;
    heightMm;
    pixelPitch;
    resolutionWidth;
    resolutionHeight;
    powerConsumptionW;
    weightKg;
    maxPixelsPerCard;
    unitPriceCents;
    createdAt;
    updatedAt;
    product;
}
exports.ModuleResponseDto = ModuleResponseDto;
//# sourceMappingURL=module.dto.js.map