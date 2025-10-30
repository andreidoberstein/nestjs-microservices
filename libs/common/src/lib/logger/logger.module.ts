import { Module } from "@nestjs/common";
import pino from 'pino';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        logger: pino({
          transport: process.env["NODE_ENV"] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        }),
        autoLogging: true
      }
    }),
  ],
  exports: [PinoLoggerModule]
})
export class LoggerModule {}
