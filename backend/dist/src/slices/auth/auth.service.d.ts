import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, LoginResponseDto, RefreshTokenResponseDto } from './dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<LoginResponseDto>;
    googleLogin(googleUser: any): Promise<LoginResponseDto>;
    refreshToken(oldRefreshToken: string): Promise<RefreshTokenResponseDto>;
    logout(refreshToken: string): Promise<void>;
    me(userId: string): Promise<{
        id: string;
        createdAt: Date;
        email: string;
        role: import("@prisma/client").$Enums.UserRole;
        isActive: boolean;
        salesforceAccountId: string | null;
        orderEmail: string | null;
        billingEmail: string | null;
        firstName: string | null;
        lastName: string | null;
        company: string | null;
    }>;
    private generateTokens;
    private storeRefreshToken;
    hashPassword(password: string): Promise<string>;
}
