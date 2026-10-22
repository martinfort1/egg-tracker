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
  
  const devOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ];

  const origin = process.env.NODE_ENV === "production" 
    ? process.env.BASE_URL ?? "https://eggtrack.vercel.app"
    : (process.env.BASE_URL ? [process.env.BASE_URL, ...devOrigins] : devOrigins);
  
  app.enableCors({
    origin,
    credentials: true
  })
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
