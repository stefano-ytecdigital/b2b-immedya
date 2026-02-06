import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private authService;
    private configService;
    private readonly logger;
    constructor(authService: AuthService, configService: ConfigService);
    login(loginDto: LoginDto): Promise<import("./dto").LoginResponseDto>;
    googleAuth(): Promise<void>;
    googleAuthCallback(req: Request, res: Response): Promise<void>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<import("./dto").RefreshTokenResponseDto>;
    logout(refreshTokenDto: RefreshTokenDto, user: any): Promise<{
        message: string;
    }>;
    me(user: any): Promise<{
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
}
