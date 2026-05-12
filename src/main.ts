import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { env } from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: false,}
    },
  ));
  app.enableCors({
    origin: ["http://localhost:3001", "http://localhost:3000", 
      "http://192.168.1.19:3000", "http://192.168.1.19:3001", "http://127.0.0.1:3001",
      "https://jester-washbowl-kimono.ngrok-free.dev/",    
      // env.process.NODE_ENV === "production" ? "https://egg-tracker.vercel.app" : "http://localhost:3000"
    ],
    credentials: true
  })
  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
