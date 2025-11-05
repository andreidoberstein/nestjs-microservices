import type { Request } from 'express';

export interface RefreshExtractor {
  extract(req: Request): string | null;
}

export class CookieRefreshExtractor implements RefreshExtractor {
  constructor(private cookieName = process.env["COOKIE_NAME_RT"] || 'rt') {}
  extract(req: Request): string | null {
    return (req.cookies?.[this.cookieName] as string) || null;
  }
}

export class HeaderRefreshExtractor implements RefreshExtractor {
  constructor(private header = 'x-refresh-token') {}
  extract(req: Request): string | null {
    const v = req.headers?.[this.header];
    return (Array.isArray(v) ? v[0] : v) ?? null;
  }
}
