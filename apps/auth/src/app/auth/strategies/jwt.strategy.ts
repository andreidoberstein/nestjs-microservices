import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { Injectable } from '@nestjs/common';

const cookie = (name: string) => (req: Request) => req?.cookies?.[name] ?? null;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookie(process.env.COOKIE_NAME_AT ?? 'at'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }
  validate(payload: any) { return payload; }
}


// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { JwtPayload } from '@app/common';
// import type { Request } from 'express';
//
// function cookieExtractor(name: string) {
//   return (req: Request) => req?.cookies?.[name] ?? null;
// }
//
// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
//   constructor() {
//     super({
//       // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       jwtFromRequest: ExtractJwt.fromExtractors([
//         cookieExtractor('rt'), // access token em cookie
//         ExtractJwt.fromAuthHeaderAsBearerToken(), // ou via Bearer
//       ]),
//       ignoreExpiration: false,
//       secretOrKey: process.env.JWT_SECRET!,
//     });
//   }
//
//   async validate(payload: JwtPayload) {
//     return payload;
//   }
// }
