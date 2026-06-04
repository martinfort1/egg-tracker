import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: false,}
    },
  ));
  
  const origin = process.env.NODE_ENV === "production" 
    ? process.env.BASE_URL ?? "https://eggtrack.vercel.app"
    : "http://localhost:3000";
  
  app.enableCors({
    origin,
    credentials: true
  })
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
