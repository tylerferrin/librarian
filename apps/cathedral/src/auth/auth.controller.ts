import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { AuthUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Stub login — returns a dev JWT.
   * Replace with WorkOS authentication redirect/callback in production.
   */
  @Post('login')
  login(): { accessToken: string } {
    const user = this.authService.getMockUser();
    return { accessToken: this.authService.signDevToken(user) };
  }

  /**
   * Returns the currently authenticated user.
   * Shape matches future WorkOS User object.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }
}
