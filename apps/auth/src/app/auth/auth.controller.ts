import {Body, Controller, Get, Post, Req, Res, UseGuards} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express'
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {JwtAuthGuard, AuthUser, Roles, RolesGuard} from '@app/common';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    const at = await this.auth.signAccessToken(user);
    const rt = await this.auth.signRefreshToken(user);

    res.cookie(process.env.COOKIE_NAME_AT ?? 'at', at, {
      ...this.auth.cookieOptions(),
      maxAge: 15 * 60 * 1000,
    });
    res.cookie(process.env.COOKIE_NAME_RT ?? 'rt', rt, {
      ...this.auth.cookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token: at };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any; // payload do refresh: sub, email
    const at = this.auth.signAccessToken(user);

    res.cookie(process.env.COOKIE_NAME_AT ?? 'at', at, {
      ...this.auth.cookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    return { access_token: at };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(process.env.COOKIE_NAME_AT ?? 'at', { path: '/' });
    res.clearCookie(process.env.COOKIE_NAME_RT ?? 'rt', { path: '/' });
    return { ok: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  onlyAdmin() {
    return { ok: true, role: 'admin' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@AuthUser() user: any) {
    return { ok: true, user };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
