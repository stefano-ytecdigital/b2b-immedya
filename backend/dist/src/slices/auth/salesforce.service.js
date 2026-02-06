"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SalesforceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesforceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const auth_service_1 = require("./auth.service");
const jsforce = __importStar(require("jsforce"));
const client_1 = require("@prisma/client");
let SalesforceService = SalesforceService_1 = class SalesforceService {
    prisma;
    authService;
    configService;
    logger = new common_1.Logger(SalesforceService_1.name);
    conn;
    constructor(prisma, authService, configService) {
        this.prisma = prisma;
        this.authService = authService;
        this.configService = configService;
        this.initializeConnection();
    }
    initializeConnection() {
        this.conn = new jsforce.Connection({
            loginUrl: this.configService.get('SALESFORCE_LOGIN_URL', 'https://login.salesforce.com'),
        });
    }
    async login() {
        const username = this.configService.get('SALESFORCE_USERNAME');
        const password = this.configService.get('SALESFORCE_PASSWORD');
        const securityToken = this.configService.get('SALESFORCE_SECURITY_TOKEN');
        if (!username || !password) {
            this.logger.warn('Salesforce credentials not configured, skipping login');
            return;
        }
        try {
            await this.conn.login(username, password + (securityToken || ''));
            this.logger.log('Successfully connected to Salesforce');
        }
        catch (error) {
            this.logger.error(`Failed to connect to Salesforce: ${error.message}`);
            throw error;
        }
    }
    async syncUsersFromSalesforce() {
        this.logger.log('Starting user sync from Salesforce...');
        try {
            await this.login();
            const result = await this.conn.query(`SELECT Id, Partner__c, AuthPiatt__c, UserPiatt__c, PwdPiatt__c, EmailOrdine__c, EmailAmm__c
         FROM Partner_B2B__c
         WHERE AuthPiatt__c = true`);
            this.logger.log(`Found ${result.totalSize} active partners in Salesforce`);
            for (const partner of result.records) {
                await this.upsertUser(partner);
            }
            await this.deactivateRemovedUsers(result.records);
            this.logger.log('User sync completed successfully');
        }
        catch (error) {
            this.logger.error(`User sync failed: ${error.message}`, error.stack);
        }
    }
    async upsertUser(partner) {
        const email = partner.UserPiatt__c;
        if (!email) {
            this.logger.warn(`Partner ${partner.Id} has no email, skipping`);
            return;
        }
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            let passwordHash = partner.PwdPiatt__c;
            if (passwordHash && !passwordHash.startsWith('$2')) {
                passwordHash = await this.authService.hashPassword(passwordHash);
            }
            if (existingUser) {
                await this.prisma.user.update({
                    where: { email },
                    data: {
                        passwordHash,
                        isActive: partner.AuthPiatt__c,
                        salesforceAccountId: partner.Partner__c,
                        orderEmail: partner.EmailOrdine__c,
                        billingEmail: partner.EmailAmm__c,
                    },
                });
                this.logger.debug(`Updated user: ${email}`);
            }
            else {
                await this.prisma.user.create({
                    data: {
                        email,
                        passwordHash,
                        role: client_1.UserRole.PARTNER,
                        isActive: partner.AuthPiatt__c,
                        salesforceAccountId: partner.Partner__c,
                        orderEmail: partner.EmailOrdine__c,
                        billingEmail: partner.EmailAmm__c,
                    },
                });
                this.logger.log(`Created new partner user: ${email}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to upsert user ${email}: ${error.message}`);
        }
    }
    async deactivateRemovedUsers(activePartners) {
        const activeEmails = activePartners.map((p) => p.UserPiatt__c).filter(Boolean);
        const result = await this.prisma.user.updateMany({
            where: {
                role: client_1.UserRole.PARTNER,
                email: {
                    notIn: activeEmails,
                },
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });
        if (result.count > 0) {
            this.logger.log(`Deactivated ${result.count} users no longer in Salesforce`);
        }
    }
    async triggerManualSync() {
        this.logger.log('Manual sync triggered');
        await this.syncUsersFromSalesforce();
    }
};
exports.SalesforceService = SalesforceService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesforceService.prototype, "syncUsersFromSalesforce", null);
exports.SalesforceService = SalesforceService = SalesforceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService,
        config_1.ConfigService])
], SalesforceService);
//# sourceMappingURL=salesforce.service.js.map