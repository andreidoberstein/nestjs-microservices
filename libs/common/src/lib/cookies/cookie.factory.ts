import { Injectable } from '@nestjs/common';

export type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  domain: string;
  path: string;
  maxAge?: number;
};

@Injectable()
export class CookieFactory {
  options(base?: Partial<CookieOptions>): CookieOptions {
    const defaults: CookieOptions = {
      httpOnly: true,
      secure: process.env["COOKIE_SECURE"] === 'true',
      sameSite: (process.env["COOKIE_SAMESITE"] as any) ?? 'lax',
      domain: process.env["COOKIE_DOMAIN"] || 'localhost',
      path: '/',
    };
    return { ...defaults, ...base };
  }
}
