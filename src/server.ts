import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

let cachedServer: Express;

export async function bootstrapServer(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);

    const app = await NestFactory.create(AppModule, adapter);
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: {
          enableImplicitConversion: false,
        },
      }),
    );

    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];

    const allowedOrigins: (string | RegExp)[] = [
      'https://eggtrack.vercel.app',
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

    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}
