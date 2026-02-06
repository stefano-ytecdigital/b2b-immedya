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
exports.QuotationResponseDto = exports.CreateQuotationDto = exports.CalculateQuoteDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CalculateQuoteDto {
    kitId;
    quantity;
}
exports.CalculateQuoteDto = CalculateQuoteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CalculateQuoteDto.prototype, "kitId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CalculateQuoteDto.prototype, "quantity", void 0);
class CreateQuotationDto {
    kitId;
    quantity;
    projectName;
    customerBudgetCents;
    installationCity;
    requestedDeliveryDate;
    internetConnection;
    contentType;
    contentManagement;
    anchoringSystem;
    anchoringMaterial;
    customerCategory;
    hasExistingSoftware;
    needsVideorender;
    productsDescription;
    commercialNotes;
    needsSiteSurvey;
}
exports.CreateQuotationDto = CreateQuotationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "kitId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateQuotationDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "projectName", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateQuotationDto.prototype, "customerBudgetCents", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "installationCity", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "requestedDeliveryDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.InternetConnection),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "internetConnection", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ContentType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ContentManagement),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "contentManagement", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AnchoringSystem),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "anchoringSystem", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.AnchoringMaterial),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "anchoringMaterial", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.CustomerCategory),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "customerCategory", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuotationDto.prototype, "hasExistingSoftware", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuotationDto.prototype, "needsVideorender", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "productsDescription", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "commercialNotes", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateQuotationDto.prototype, "needsSiteSurvey", void 0);
class QuotationResponseDto {
    id;
    userId;
    kitId;
    salesforceQuoteId;
    salesforceQuoteNumber;
    phase;
    projectName;
    totalCostCents;
    pdfUrl;
    createdAt;
    updatedAt;
    kit;
}
exports.QuotationResponseDto = QuotationResponseDto;
//# sourceMappingURL=quotation.dto.js.map