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

  const allowedOrigins: (string | RegExp)[] = [
    "https://eggtrack.vercel.app",
    /\.vercel\.app$/,
    ...devOrigins,
  ];

  if (process.env.BASE_URL) {
    allowedOrigins.push(process.env.BASE_URL);
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
