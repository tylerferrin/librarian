import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WorkOS } from '@workos-inc/node';
import { UsersService } from '../users/users.service';
import type { AuthUser } from './auth.types';

@Injectable()
export class AuthService implements OnModuleInit {
  private workos!: WorkOS;
  private clientId!: string;
  private redirectUri!: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  onModuleInit(): void {
    this.workos = new WorkOS(
      this.configService.getOrThrow<string>('WORKOS_API_KEY'),
    );
    this.clientId = this.configService.getOrThrow<string>('WORKOS_CLIENT_ID');
    this.redirectUri = this.configService.getOrThrow<string>(
      'WORKOS_REDIRECT_URI',
    );
  }

  getAuthorizationUrl(): string {
    return this.workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId: this.clientId,
      redirectUri: this.redirectUri,
    });
  }

  async authenticateWithCode(
    code: string,
  ): Promise<{ accessToken: string; user: AuthUser }> {
    const { user: workosUser } =
      await this.workos.userManagement.authenticateWithCode({
        clientId: this.clientId,
        code,
      });

    await this.usersService.findOrCreate(workosUser.id, workosUser.email);

    const authUser: AuthUser = {
      id: workosUser.id,
      email: workosUser.email,
      firstName: workosUser.firstName,
      lastName: workosUser.lastName,
      emailVerified: workosUser.emailVerified,
    };

    const accessToken = this.jwtService.sign({
      sub: authUser.id,
      email: authUser.email,
    });

    return { accessToken, user: authUser };
  }

  verifyToken(token: string): AuthUser | null {
    const devToken = this.configService.get<string>('DEV_TOKEN');
    if (devToken && token === devToken) {
      return this.getMockUser();
    }

    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
      }>(token);
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

  async devLogin(): Promise<{ accessToken: string; user: AuthUser }> {
    const mockUser: AuthUser = {
      id: 'user_01KN53Z8BSFJ5Q2MXJZJS8C3XQ',
      email: 'tyferrin@gmail.com',
      firstName: null,
      lastName: null,
      emailVerified: true,
    };

    await this.usersService.findOrCreate(mockUser.id, mockUser.email);

    const accessToken = this.jwtService.sign({
      sub: mockUser.id,
      email: mockUser.email,
    });

    return { accessToken, user: mockUser };
  }

  getMockUser(): AuthUser {
    return {
      id: 'user_01KN53Z8BSFJ5Q2MXJZJS8C3XQ',
      email: 'tyferrin@gmail.com',
      firstName: null,
      lastName: null,
      emailVerified: true,
    };
  }
}
