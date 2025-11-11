import {Injectable, UnauthorizedException} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {CookieFactory, IUserClient, TokenFactory} from '@app/common';

type UserCore = { _id: string; email: string; name: string; roles?: string[]; password?: string; refreshTokenHash?: string };

@Injectable()
export class AuthService {
  private readonly cookieNameRT = process.env.COOKIE_NAME_RT || 'rt';
  private readonly cookieNameAT = process.env.COOKIE_NAME_AT || 'at';

  constructor(
    private readonly users: IUserClient,
    public readonly tokens: TokenFactory,
    public readonly cookies: CookieFactory,
  ) {}

  async signAccessToken(user: UserCore | { _id: string; email: string; roles?: string[] }) {
    const payload = { sub: user._id, email: user.email, roles: user.roles ?? ['user'] };
    return this.tokens.signAccess(payload);
  }

  async signRefreshToken(user: UserCore | { _id: string; email: string }) {
    const payload = { sub: user._id, email: user.email };
    return this.tokens.signRefresh(payload);
  }

  async buildAccessUserFromRefresh(payload: { sub: string; email: string }) {
    const full = await this.users.findById(payload.sub);
    if (!full) {
      throw new UnauthorizedException('User not found on refresh');
    }
    return {
      _id: payload.sub,
      email: payload.email,
      roles: full?.roles,
    };
  }

  async validateUser(email: string, password: string) {
    let user: UserCore | null = null;
    try {
      user = await this.users.findByEmail(email);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user?.password) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return { _id: user._id, email: user.email, name: user.name, roles: user.roles ?? ['user'] };
  }

  cookieOptionsAT() {
    return this.cookies.options({ maxAge: 15 * 60 * 1000 });
  }
  cookieOptionsRT() {
    return this.cookies.options({ maxAge: 7 * 24 * 60 * 60 * 1000 });
  }

  cookieNames() {
    return { at: this.cookieNameAT, rt: this.cookieNameRT };
  }

  async logout(_userId: string) {
    return { loggedOut: true };
  }

  cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAMESITE as any) ?? 'lax',
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      path: '/',
    };
  }
}
