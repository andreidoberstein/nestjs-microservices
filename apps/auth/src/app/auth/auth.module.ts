import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {HttpModule} from "@nestjs/axios";
import { JwtModule } from '@nestjs/jwt';
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {LocalStrategy} from "./strategies/local.strategy";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {FactoriesModule, UsersClientModule} from "@app/common";
import {JwtRefreshStrategy} from "./strategies/jwt-refresh.strategy";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UsersClientModule,
    FactoriesModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy
  ]
})
export class AuthModule {}
