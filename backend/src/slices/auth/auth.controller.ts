import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  /**
   * POST /auth/login
   * Login with Salesforce credentials (Partner B2B)
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  /**
   * GET /auth/google
   * Initiate Google OAuth flow (Admin only)
   */
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  /**
   * GET /auth/google/callback
   * Google OAuth callback
   */
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const googleUser = req.user;
      const result = await this.authService.googleLogin(googleUser);

      // Redirect to frontend with tokens in URL params
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
      const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;

      this.logger.log(`Google OAuth successful for ${result.user.email}, redirecting to frontend`);
      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`Google OAuth callback error: ${error.message}`);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
      res.redirect(`${frontendUrl}/auth/error?message=Authentication failed`);
    }
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.log('Token refresh requested');
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Logout (invalidate refresh token)
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshTokenDto: RefreshTokenDto, @CurrentUser() user: any) {
    this.logger.log(`User ${user.email} logging out`);
    await this.authService.logout(refreshTokenDto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  /**
   * GET /auth/me
   * Get current user info
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: any) {
    return this.authService.me(user.id);
  }
}
