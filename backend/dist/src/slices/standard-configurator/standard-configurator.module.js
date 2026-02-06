"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardConfiguratorModule = void 0;
const common_1 = require("@nestjs/common");
const standard_configurator_controller_1 = require("./standard-configurator.controller");
const standard_configurator_service_1 = require("./standard-configurator.service");
const prisma_module_1 = require("../../common/prisma/prisma.module");
const services_module_1 = require("../../common/services/services.module");
let StandardConfiguratorModule = class StandardConfiguratorModule {
};
exports.StandardConfiguratorModule = StandardConfiguratorModule;
exports.StandardConfiguratorModule = StandardConfiguratorModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, services_module_1.ServicesModule],
        controllers: [standard_configurator_controller_1.StandardConfiguratorController],
        providers: [standard_configurator_service_1.StandardConfiguratorService],
        exports: [standard_configurator_service_1.StandardConfiguratorService],
    })
], StandardConfiguratorModule);
//# sourceMappingURL=standard-configurator.module.js.map