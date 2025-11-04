import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {HttpModule} from "@nestjs/axios";
import { JwtModule } from '@nestjs/jwt';
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {LocalStrategy} from "./strategies/local.strategy";
import {JwtStrategy} from "./strategies/jwt.strategy";

@Module({
  imports: [
    PassportModule,
    HttpModule.register({ timeout: 3000 }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 3600),
      },
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy]
})
export class AuthModule {}
