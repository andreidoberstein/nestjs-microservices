import {Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";

export type AccessPayload = {
  sub: string
  email: string
  roles: string[]
}

export type RefreshPayload = {
  sub: string
  email: string
}

@Injectable()
export class TokenFactory {
  constructor(private readonly jwt: JwtService) {}

  async signAccess(payload: AccessPayload) {
    return this.jwt.signAsync(payload, {
      secret: process.env["JWT_SECRET"]!,
      expiresIn: Number(process.env["JWT_EXPIRES_IN"]),
    });
  }

  async signRefresh(payload: RefreshPayload) {
    return this.jwt.signAsync(payload, {
      secret: process.env["REFRESH_SECRET"]!,
      expiresIn: Number(process.env["REFRESH_EXPIRES_IN"]) || '7d',
    })
  }
}
