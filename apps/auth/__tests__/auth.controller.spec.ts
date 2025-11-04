import { Test } from '@nestjs/testing';
import { AuthController } from '../src/app/auth/auth.controller';
import { AuthService } from '../src/app/auth/auth.service';

describe('AuthController (unit)', () => {
  let controller: AuthController;

  const authService = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    cookieOptions: jest.fn().mockReturnValue({ httpOnly: true, path: '/' }),
  };

  beforeAll(async () => {
    process.env.COOKIE_NAME_AT = 'at';
    process.env.COOKIE_NAME_RT = 'rt';

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = moduleRef.get(AuthController);
  });

  beforeEach(() => jest.clearAllMocks());

  it('login → retorna access_token e seta cookies AT/RT', async () => {
    // bypass do AuthGuard('local'): simulamos req.user já preenchido
    const user = { _id: '1', email: 'a@a.com', roles: ['user'] };
    const req: any = { user };
    const res: any = { cookie: jest.fn() };

    authService.signAccessToken.mockResolvedValue('access.token');
    authService.signRefreshToken.mockResolvedValue('refresh.token');

    const result = await controller.login(req, res);

    expect(authService.signAccessToken).toHaveBeenCalledWith(user);
    expect(authService.signRefreshToken).toHaveBeenCalledWith(user);

    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.cookie).toHaveBeenNthCalledWith(
      1,
      'at',
      'access.token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
    expect(res.cookie).toHaveBeenNthCalledWith(
      2,
      'rt',
      'refresh.token',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );

    expect(result).toEqual({ access_token: 'access.token' });
  });

  it('refresh → renova access_token e seta cookie AT', async () => {
    // bypass do AuthGuard('jwt-refresh'): simulamos req.user válido
    const req: any = { user: { sub: '1', email: 'a@a.com' } };
    const res: any = { cookie: jest.fn() };

    authService.signAccessToken.mockResolvedValue('new.access');

    const result = await controller.refresh(req, res);

    expect(authService.signAccessToken).toHaveBeenCalledWith(req.user);
    expect(res.cookie).toHaveBeenCalledWith(
      'at',
      'new.access',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
    expect(result).toEqual({ access_token: 'new.access' });
  });

  it('logout → limpa cookies e retorna ok', async () => {
    const res: any = { clearCookie: jest.fn() };

    const result = await controller.logout(res);

    expect(res.clearCookie).toHaveBeenCalledWith('at', expect.any(Object));
    expect(res.clearCookie).toHaveBeenCalledWith('rt', expect.any(Object));
    expect(result).toEqual({ ok: true });
  });
});
