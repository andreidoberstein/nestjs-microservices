import { Test } from '@nestjs/testing';
import { AuthService } from '../src/app/auth/auth.service';
import * as bcrypt from 'bcryptjs';
import { IUserClient, TokenFactory, CookieFactory } from '@app/common';

describe('AuthService (unit)', () => {
  let service: AuthService;

  const usersClient: jest.Mocked<IUserClient> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    setRefreshToken: jest.fn()
  } as any;

  const tokens: jest.Mocked<TokenFactory> = {
    signAccess: jest.fn(),
    signRefresh: jest.fn()
  } as any;

  const cookies: jest.Mocked<CookieFactory> = {
    options: jest.fn().mockReturnValue({ httpOnly: true, path: '/' })
  } as any;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: IUserClient, useValue: usersClient },
        { provide: TokenFactory, useValue: tokens },
        { provide: CookieFactory, useValue: cookies },
      ],
    }).compile();

    service = mod.get(AuthService);
  });

  beforeEach(() => jest.clearAllMocks());

  it('validateUser → ok com senha correta', async () => {
    const hash = await bcrypt.hash('123456', 10);
    usersClient.findByEmail.mockResolvedValue({
      _id: '1', email: 'a@a.com', name: 'A', password: hash, roles: ['user']
    } as any);

    const res = await service.validateUser('a@a.com', '123456');
    expect(res._id).toBe('1');
    expect(res.roles).toEqual(['user']);
  });

  it('signAccessToken → usa TokenFactory', async () => {
    tokens.signAccess.mockResolvedValue('access.token');
    const at = await service.signAccessToken({ _id: '1', email: 'a@a.com', roles: ['admin'] } as any);
    expect(tokens.signAccess).toHaveBeenCalledWith({ sub: '1', email: 'a@a.com', roles: ['admin'] });
    expect(at).toBe('access.token');
  });

  it('signRefreshToken → usa TokenFactory', async () => {
    tokens.signRefresh.mockResolvedValue('refresh.token');
    const rt = await service.signRefreshToken({ _id: '1', email: 'a@a.com' } as any);
    expect(tokens.signRefresh).toHaveBeenCalledWith({ sub: '1', email: 'a@a.com' });
    expect(rt).toBe('refresh.token');
  });

  it('cookie options helpers → chamam CookieFactory', () => {
    const a = service.cookieOptionsAT();
    const r = service.cookieOptionsRT();
    expect(cookies.options).toHaveBeenCalledTimes(2);
    expect(a).toMatchObject({ httpOnly: true });
    expect(r).toMatchObject({ httpOnly: true });
  });
});
