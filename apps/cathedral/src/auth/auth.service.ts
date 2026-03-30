import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { AuthUser } from './auth.types';

/**
 * Auth service — currently a stub returning a hardcoded dev user.
 * When WorkOS is integrated, this service will:
 *   - Verify WorkOS session tokens
 *   - Call WorkOS SDK to fetch the real user
 *   - Sync users to the local DB via UsersService.findOrCreate()
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  getMockUser(): AuthUser {
    return {
      id: 'dev-user-id',
      email: 'dev@librarian.local',
      firstName: 'Dev',
      lastName: 'User',
      emailVerified: true,
    };
  }

  signDevToken(user: AuthUser): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  verifyToken(token: string): AuthUser | null {
    const devToken = this.configService.get<string>('DEV_TOKEN');
    if (devToken && token === devToken) {
      return this.getMockUser();
    }

    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(token);
      return {
        id: payload.sub,
        email: payload.email,
        firstName: null,
        lastName: null,
        emailVerified: true,
      };
    } catch {
      return null;
    }
  }
}
