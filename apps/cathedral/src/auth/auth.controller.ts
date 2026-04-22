import { Controller, Get, Post, Query, Redirect, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { AuthUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /** Returns the WorkOS AuthKit authorization URL for the frontend to redirect to. */
  @Get('url')
  getAuthUrl(): { url: string } {
    return { url: this.authService.getAuthorizationUrl() };
  }

  /** WorkOS redirects here after authentication. Exchanges the code for a JWT and redirects to the frontend. */
  @Get('callback')
  @Redirect()
  async callback(
    @Query('code') code: string,
  ): Promise<{ url: string; statusCode: number }> {
    const { accessToken } = await this.authService.authenticateWithCode(code);
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3001';
    return {
      url: `${frontendUrl}/auth/callback?token=${encodeURIComponent(accessToken)}`,
      statusCode: 302,
    };
  }

  /** Dev-only stub login -- returns a JWT for the hardcoded dev user. */
  @Post('login')
  async login(): Promise<{ accessToken: string }> {
    const { accessToken } = await this.authService.devLogin();
    return { accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
