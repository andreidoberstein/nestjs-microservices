import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TokenFactory } from '../tokens/token.factory';
import { CookieFactory } from '../cookies/cookie.factory';

@Module({
  imports: [JwtModule.register({})],
  providers: [TokenFactory, CookieFactory],
  exports: [TokenFactory, CookieFactory],
})
export class FactoriesModule {}
