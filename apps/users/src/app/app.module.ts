import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule, LoggerModule} from "@app/common";
import {MongooseModule} from "@nestjs/mongoose";
import {UsersController} from "./users/users.controller";
import {UsersModule} from "./users/users.module";

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
