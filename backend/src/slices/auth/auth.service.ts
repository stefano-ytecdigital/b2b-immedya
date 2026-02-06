import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, LoginResponseDto, RefreshTokenResponseDto } from './dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Login with Salesforce credentials (Partner B2B)
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
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

  /**
   * Google OAuth login (Admin only)
   */
  async googleLogin(googleUser: any): Promise<LoginResponseDto> {
    const { email, firstName, lastName } = googleUser;

    // Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create as ADMIN
    if (!user) {
      this.logger.log(`Creating new ADMIN user from Google OAuth: ${email}`);
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          role: UserRole.ADMIN,
          isActive: true,
          // No passwordHash for OAuth users
        },
      });
    }

    // Verify user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email, user.role);

    // Store refresh token
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

  /**
   * Refresh access token
   */
  async refreshToken(oldRefreshToken: string): Promise<RefreshTokenResponseDto> {
    // Verify refresh token exists in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Check if token expired
    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Check if user is active
    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Generate new tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );

    // Delete old refresh token
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Store new refresh token
    await this.storeRefreshToken(storedToken.user.id, refreshToken);

    this.logger.log(`Tokens refreshed for user ${storedToken.user.email}`);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logout (invalidate refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    this.logger.log('User logged out');
  }

  /**
   * Get current user info
   */
  async me(userId: string) {
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
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m',
    } as any);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    } as any);

    return { accessToken, refreshToken };
  }

  /**
   * Store refresh token in database
   */
  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expirationDays = 7; // 7 days
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

  /**
   * Hash password (used by sync service)
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
}
