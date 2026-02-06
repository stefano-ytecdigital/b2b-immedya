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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);
        await this.storeRefreshToken(user.id, refreshToken);
        this.logger.log(`User ${user.email} logged in successfully`);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName ?? undefined,
                lastName: user.lastName ?? undefined,
            },
        };
    }
    async googleLogin(googleUser) {
        const { email, firstName, lastName } = googleUser;
        let user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            this.logger.log(`Creating new ADMIN user from Google OAuth: ${email}`);
            user = await this.prisma.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                    role: client_1.UserRole.ADMIN,
                    isActive: true,
                },
            });
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);
        await this.storeRefreshToken(user.id, refreshToken);
        this.logger.log(`User ${user.email} logged in via Google OAuth`);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.firstName ?? undefined,
                lastName: user.lastName ?? undefined,
            },
        };
    }
    async refreshToken(oldRefreshToken) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: oldRefreshToken },
            include: { user: true },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (storedToken.expiresAt < new Date()) {
            await this.prisma.refreshToken.delete({
                where: { id: storedToken.id },
            });
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        if (!storedToken.user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        const { accessToken, refreshToken } = await this.generateTokens(storedToken.user.id, storedToken.user.email, storedToken.user.role);
        await this.prisma.refreshToken.delete({
            where: { id: storedToken.id },
        });
        await this.storeRefreshToken(storedToken.user.id, refreshToken);
        this.logger.log(`Tokens refreshed for user ${storedToken.user.email}`);
        return {
            accessToken,
            refreshToken,
        };
    }
    async logout(refreshToken) {
        await this.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
        this.logger.log('User logged out');
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                company: true,
                salesforceAccountId: true,
                orderEmail: true,
                billingEmail: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    async generateTokens(userId, email, role) {
        const payload = {
            sub: userId,
            email,
            role,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_SECRET'),
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION') || '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
        });
        return { accessToken, refreshToken };
    }
    async storeRefreshToken(userId, token) {
        const expirationDays = 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expirationDays);
        await this.prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    }
    async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map