import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import type { AuthUser } from './auth.types';

const mockUser: AuthUser = {
  id: 'dev-user-id',
  email: 'dev@librarian.local',
  firstName: 'Dev',
  lastName: 'User',
  emailVerified: true,
};

const mockAuthService = {
  getMockUser: jest.fn(() => mockUser),
  signDevToken: jest.fn(() => 'stub-jwt-token'),
  verifyToken: jest.fn(() => mockUser),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtAuthGuard, useValue: { canActivate: jest.fn(() => true) } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('POST /auth/login', () => {
    it('returns an accessToken', () => {
      const result = controller.login();
      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken).toBe('stub-jwt-token');
    });

    it('calls getMockUser and signDevToken', () => {
      controller.login();
      expect(mockAuthService.getMockUser).toHaveBeenCalled();
      expect(mockAuthService.signDevToken).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('GET /auth/me', () => {
    it('returns the current user passed by the guard', () => {
      const result = controller.me(mockUser);
      expect(result).toEqual(mockUser);
      expect(result.id).toBe('dev-user-id');
      expect(result.email).toBe('dev@librarian.local');
    });
  });
});
