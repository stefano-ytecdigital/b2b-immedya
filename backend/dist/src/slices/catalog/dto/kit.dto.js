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
exports.KitResponseDto = exports.UpdateKitDto = exports.CreateKitDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class KitModuleInput {
    moduleId;
    quantity;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KitModuleInput.prototype, "moduleId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], KitModuleInput.prototype, "quantity", void 0);
class CreateKitDto {
    name;
    productId;
    description;
    imageUrl;
    totalWidthMm;
    totalHeightMm;
    totalResolutionW;
    totalResolutionH;
    pixelPitch;
    totalPriceCents;
    modules;
}
exports.CreateKitDto = CreateKitDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKitDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKitDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKitDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateKitDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateKitDto.prototype, "totalWidthMm", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateKitDto.prototype, "totalHeightMm", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateKitDto.prototype, "totalResolutionW", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateKitDto.prototype, "totalResolutionH", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateKitDto.prototype, "pixelPitch", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateKitDto.prototype, "totalPriceCents", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => KitModuleInput),
    __metadata("design:type", Array)
], CreateKitDto.prototype, "modules", void 0);
class UpdateKitDto {
    name;
    productId;
    description;
    imageUrl;
    totalWidthMm;
    totalHeightMm;
    totalResolutionW;
    totalResolutionH;
    pixelPitch;
    totalPriceCents;
}
exports.UpdateKitDto = UpdateKitDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateKitDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateKitDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateKitDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateKitDto.prototype, "imageUrl", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateKitDto.prototype, "totalWidthMm", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateKitDto.prototype, "totalHeightMm", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateKitDto.prototype, "totalResolutionW", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateKitDto.prototype, "totalResolutionH", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateKitDto.prototype, "pixelPitch", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateKitDto.prototype, "totalPriceCents", void 0);
class KitResponseDto {
    id;
    name;
    productId;
    description;
    imageUrl;
    totalWidthMm;
    totalHeightMm;
    totalResolutionW;
    totalResolutionH;
    pixelPitch;
    totalPriceCents;
    createdAt;
    updatedAt;
    product;
    modules;
}
exports.KitResponseDto = KitResponseDto;
//# sourceMappingURL=kit.dto.js.map