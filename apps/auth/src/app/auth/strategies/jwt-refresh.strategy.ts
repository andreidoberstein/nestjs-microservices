import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { Injectable } from '@nestjs/common';

const cookie = (name: string) => (req: Request) => req?.cookies?.[name] ?? null;

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookie(process.env.COOKIE_NAME_RT ?? 'rt'),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_SECRET ?? process.env.JWT_SECRET!,
    });
  }
  validate(payload: any) { return payload; }
}
