import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Headers as ReqHeaders, Put
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {AuthUser, JwtAuthGuard} from "@app/common";

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'users' };
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('internal/by-email')
  async findByEmailInternal(
    @Query('email') email: string,
    @ReqHeaders('x-internal-secret') secret: string
    ) {
      if(!secret || secret !== process.env.INTERNAL_SHARED_SECRET) {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      return this.service.findByEmail(email)
  }

  @Get('internal/by-id/:id')
  async internalById(
    @Param('id') id: string,
    @ReqHeaders('x-internal-secret') secret: string
  ) {
    if(!secret || secret !== process.env.INTERNAL_SHARED_SECRET) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.service.findById(id)
  }

  @Put('internal/:id/refresh-token')
  async setRefreshToken(
    @Param('id') id: string,
    @Body('refreshToken') refreshToken: string | null,
    @ReqHeaders('x-internal-secret') secret: string,
  ) {
    if (!secret || secret !== process.env.INTERNAL_SHARED_SECRET) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.service.setRefreshTokenHash(id, refreshToken ?? null);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@AuthUser() user: any) {
    return { ok: true, user };
  }
}
