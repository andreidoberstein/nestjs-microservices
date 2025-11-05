import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard, AuthUser, Roles, RolesGuard } from '@app/common';

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

    const { at: atName, rt: rtName } = this.auth.cookieNames();
    res.cookie(atName, at, this.auth.cookieOptionsAT());
    res.cookie(rtName, rt, this.auth.cookieOptionsRT());

    return { access_token: at };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    const at = await this.auth.signAccessToken(user);

    const { at: atName } = this.auth.cookieNames();
    res.cookie(atName, at, this.auth.cookieOptionsAT());

    return { access_token: at };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    const { at: atName, rt: rtName } = this.auth.cookieNames();
    res.clearCookie(atName, { path: '/' });
    res.clearCookie(rtName, { path: '/' });
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
