import {Logger, ValidationPipe} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.enableCors({
    origin: true,
    credentials: true,
  })
  app.useGlobalPipes(new ValidationPipe({ whitelist: true , transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Login e Validation JWT')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT_AUTH || 3002;
  await app.listen(port);
  Logger.log(
    `🚀 [AUTH] Application is running on: http://localhost:${port}}`
  );
}

bootstrap();
