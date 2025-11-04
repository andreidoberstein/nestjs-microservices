import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule, LoggerModule} from "@app/common";
import {AuthModule} from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
