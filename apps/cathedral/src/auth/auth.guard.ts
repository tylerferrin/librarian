import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';

/**
 * JWT auth guard — stub implementation for local development.
 *
 * Accepts two forms of authentication:
 *   1. DEV_TOKEN env var (plain bearer, no JWT verification) — for local dev
 *   2. A signed JWT issued by signDevToken() — standard verification path
 *
 * When WorkOS is integrated, replace verifyToken() in AuthService with
 * WorkOS session verification. This guard's shape stays the same.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const user = this.authService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    (request as FastifyRequest & { user: typeof user }).user = user;
    return true;
  }

  private extractToken(request: FastifyRequest): string | null {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) return null;
    return authorization.slice(7);
  }
}
