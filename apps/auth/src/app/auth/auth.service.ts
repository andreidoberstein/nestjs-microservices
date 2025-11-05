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

  // private async getUserByEmail(email: string): Promise<UserCore | null> {
  //   const url = `${this.usersBaseUrl}/users/internal/by-email`;
  //   const { data } = await firstValueFrom(
  //     this.http.get(url, {
  //       params: { email },
  //       headers: { 'x-internal-secret': this.internalSecret },
  //     }),
  //   );
  //   return data ?? null;
  // }

  // private async getUserById(id: string): Promise<UserCore | null> {
  //   const url = `${this.usersBaseUrl}/users/internal/by-id/${id}`;
  //   const { data } = await firstValueFrom(
  //     this.http.get(url, {
  //       headers: { 'x-internal-secret': this.internalSecret },
  //     }),
  //   );
  //   return data ?? null;
  // }

  // private async setUserRefreshToken(id: string, refreshToken: string | null) {
  //   const url = `${this.usersBaseUrl}/users/internal/${id}/refresh-token`;
  //   await firstValueFrom(
  //     this.http.put(url, { refreshToken }, {
  //       headers: { 'x-internal-secret': this.internalSecret },
  //     }),
  //   );
  // }

  // async signAccessToken(user: UserCore) {
  //   const payload: JwtPayload & { roles?: string[] } = {
  //     sub: user._id,
  //     email: user.email,
  //     roles: user.roles ?? ['user'],
  //   } as any;
  //
  //   return this.jwt.signAsync(payload, {
  //     secret: process.env.JWT_SECRET!,
  //     expiresIn: Number(process.env.JWT_EXPIRES_IN) || 900,
  //   });
  // }

  // async signRefreshToken(user: UserCore) {
  //   const payload = { sub: user._id, email: user.email };
  //   return this.jwt.signAsync(payload, {
  //     secret: process.env.REFRESH_SECRET!,
  //     expiresIn: Number(process.env.REFRESH_EXPIRES_IN) || '7d',
  //   });
  // }

  // async validateUser(email: string, password: string) {
  //   let user: UserCore | null = null;
  //   try {
  //     user = await this.getUserByEmail(email);
  //   } catch {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  //   if (!user?.password) throw new UnauthorizedException('Invalid credentials');
  //
  //   const isValid = await bcrypt.compare(password, user.password);
  //   if (!isValid) throw new UnauthorizedException('Invalid credentials');
  //
  //   return { _id: user._id, email: user.email, name: user.name, roles: user.roles ?? ['user'] };
  // }
  //
  // async logout(userId: string) {
  //   await this.setUserRefreshToken(userId, null);
  //   return { loggedOut: true };
  // }

  async signAccessToken(user: UserCore | { _id: string; email: string; roles?: string[] }) {
    const payload = { sub: user._id, email: user.email, roles: user.roles ?? ['user'] };
    return this.tokens.signAccess(payload);
  }

  async signRefreshToken(user: UserCore | { _id: string; email: string }) {
    const payload = { sub: user._id, email: user.email };
    return this.tokens.signRefresh(payload);
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
