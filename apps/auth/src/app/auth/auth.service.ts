import {HttpService} from '@nestjs/axios';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {firstValueFrom} from 'rxjs';
import * as bcrypt from 'bcryptjs';
import {JwtService} from '@nestjs/jwt';
import {JwtPayload} from '@app/common';

type UserCore = { _id: string; email: string; name: string; roles?: string[]; password?: string; refreshTokenHash?: string };

@Injectable()
export class AuthService {
  private readonly usersBaseUrl = process.env.USERS_SERVICE_URL!;
  private readonly internalSecret = process.env.INTERNAL_SHARED_SECRET!;
  private readonly cookieName = process.env.COOKIE_NAME_RT || 'rt';

  constructor(
    private readonly http: HttpService,
    private readonly jwt: JwtService,
  ) {}

  private async getUserByEmail(email: string): Promise<UserCore | null> {
    const url = `${this.usersBaseUrl}/users/internal/by-email`;
    const { data } = await firstValueFrom(
      this.http.get(url, {
        params: { email },
        headers: { 'x-internal-secret': this.internalSecret },
      }),
    );
    return data ?? null;
  }

  private async getUserById(id: string): Promise<UserCore | null> {
    const url = `${this.usersBaseUrl}/users/internal/by-id/${id}`;
    const { data } = await firstValueFrom(
      this.http.get(url, {
        headers: { 'x-internal-secret': this.internalSecret },
      }),
    );
    return data ?? null;
  }

  private async setUserRefreshToken(id: string, refreshToken: string | null) {
    const url = `${this.usersBaseUrl}/users/internal/${id}/refresh-token`;
    await firstValueFrom(
      this.http.put(url, { refreshToken }, {
        headers: { 'x-internal-secret': this.internalSecret },
      }),
    );
  }

  async signAccessToken(user: UserCore) {
    const payload: JwtPayload & { roles?: string[] } = {
      sub: user._id,
      email: user.email,
      roles: user.roles ?? ['user'],
    } as any;

    return this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET!,
      expiresIn: Number(process.env.JWT_EXPIRES_IN) || 900,
    });
  }

  async signRefreshToken(user: UserCore) {
    const payload = { sub: user._id, email: user.email };
    return this.jwt.signAsync(payload, {
      secret: process.env.REFRESH_SECRET!,
      expiresIn: Number(process.env.REFRESH_EXPIRES_IN) || '7d',
    });
  }

  async validateUser(email: string, password: string) {
    let user: UserCore | null = null;
    try {
      user = await this.getUserByEmail(email);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user?.password) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return { _id: user._id, email: user.email, name: user.name, roles: user.roles ?? ['user'] };
  }

  // async login(user: { _id: string; email: string; name?: string; roles?: string[] }) {
  //   const freshUser = await this.getUserById(user._id);
  //   const finalUser = freshUser ?? (user as UserCore);
  //
  //   const access_token = this.signAccessToken(finalUser);
  //   const refresh_token = this.signRefreshToken(finalUser);
  //
  //   await this.setUserRefreshToken(finalUser._id, refresh_token);
  //
  //   const cookieName = process.env.COOKIE_NAME_RT;
  //
  //   res.cookie(cookieName, data.refresh_token, this.auth.cookieOptions());
  //
  //   return { access_token, refresh_token };
  // }

  // async refresh(userIdFromCookie: string, refreshFromCookie: string) {
  //   try {
  //     this.jwt.verify(refreshFromCookie, { secret: process.env.REFRESH_SECRET });
  //   } catch {
  //     throw new UnauthorizedException('Invalid refresh');
  //   }
  //
  //   const user = await this.getUserById(userIdFromCookie);
  //   if (!user?.refreshTokenHash) throw new UnauthorizedException('No refresh stored');
  //
  //   const ok = await bcrypt.compare(refreshFromCookie, user.refreshTokenHash);
  //   if (!ok) throw new UnauthorizedException('Refresh mismatch');
  //
  //   const access_token = this.signAccessToken(user);
  //   const new_refresh = this.signRefreshToken(user);
  //   await this.setUserRefreshToken(user._id, new_refresh);
  //
  //   return { access_token, refresh_token: new_refresh, userId: user._id };
  // }

  async logout(userId: string) {
    await this.setUserRefreshToken(userId, null);
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
