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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const config_1 = require("@nestjs/config");
let PrismaService = PrismaService_1 = class PrismaService {
    configService;
    logger = new common_1.Logger(PrismaService_1.name);
    prisma;
    pool;
    constructor(configService) {
        this.configService = configService;
        this.pool = new pg_1.Pool({
            connectionString: this.configService.get('DATABASE_URL'),
        });
        const adapter = new adapter_pg_1.PrismaPg(this.pool);
        this.prisma = new client_1.PrismaClient({
            adapter,
            log: [
                { level: 'warn', emit: 'event' },
                { level: 'error', emit: 'event' },
            ],
        });
    }
    async onModuleInit() {
        this.logger.log('Connecting to PostgreSQL database...');
        await this.prisma.$connect();
        this.logger.log('Successfully connected to database');
    }
    async onModuleDestroy() {
        this.logger.log('Disconnecting from database...');
        await this.prisma.$disconnect();
        await this.pool.end();
        this.logger.log('Database connection closed');
    }
    get user() {
        return this.prisma.user;
    }
    get refreshToken() {
        return this.prisma.refreshToken;
    }
    get product() {
        return this.prisma.product;
    }
    get module() {
        return this.prisma.module;
    }
    get kit() {
        return this.prisma.kit;
    }
    get kitModule() {
        return this.prisma.kitModule;
    }
    get quotation() {
        return this.prisma.quotation;
    }
    get $transaction() {
        return this.prisma.$transaction.bind(this.prisma);
    }
    get $queryRaw() {
        return this.prisma.$queryRaw.bind(this.prisma);
    }
    get $executeRaw() {
        return this.prisma.$executeRaw.bind(this.prisma);
    }
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production');
        }
        await this.prisma.$transaction([
            this.prisma.quotation.deleteMany(),
            this.prisma.kitModule.deleteMany(),
            this.prisma.kit.deleteMany(),
            this.prisma.module.deleteMany(),
            this.prisma.product.deleteMany(),
            this.prisma.refreshToken.deleteMany(),
            this.prisma.user.deleteMany(),
        ]);
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map