import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const JWT_SECRET = 'test-secret';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn((payload: object) =>
              Buffer.from(JSON.stringify(payload)).toString('base64'),
            ),
            verify: jest.fn((token: string) => JSON.parse(Buffer.from(token, 'base64').toString())),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => (key === 'JWT_SECRET' ? JWT_SECRET : undefined)),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('getMockUser', () => {
    it('returns the hardcoded dev user', () => {
      const user = service.getMockUser();
      expect(user.id).toBe('dev-user-id');
      expect(user.email).toBe('dev@librarian.local');
      expect(user.emailVerified).toBe(true);
    });
  });

  describe('signDevToken', () => {
    it('signs a token containing sub and email', () => {
      const user = service.getMockUser();
      service.signDevToken(user);
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: user.id, email: user.email });
    });

    it('returns a string', () => {
      const token = service.signDevToken(service.getMockUser());
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('verifyToken', () => {
    it('returns the mock user when token matches DEV_TOKEN', () => {
      const configService = service['configService'] as ConfigService;
      jest.spyOn(configService, 'get').mockReturnValue('my-dev-token');

      const user = service.verifyToken('my-dev-token');
      expect(user).not.toBeNull();
      expect(user?.id).toBe('dev-user-id');
    });

    it('returns null when DEV_TOKEN is set but token does not match', () => {
      const configService = service['configService'] as ConfigService;
      jest.spyOn(configService, 'get').mockReturnValue('correct-token');

      const user = service.verifyToken('wrong-token');
      expect(user).toBeNull();
    });

    it('verifies a JWT issued by signDevToken', () => {
      const mockUser = service.getMockUser();
      const token = service.signDevToken(mockUser);

      // verifyToken calls jwtService.verify which returns the encoded payload
      const user = service.verifyToken(token);
      expect(user).not.toBeNull();
      expect(user?.id).toBe(mockUser.id);
      expect(user?.email).toBe(mockUser.email);
    });

    it('returns null for an invalid token', () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('invalid token');
      });

      const user = service.verifyToken('not-a-valid-jwt');
      expect(user).toBeNull();
    });
  });
});
