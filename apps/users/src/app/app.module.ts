import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule, LoggerModule} from "@app/common";
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
