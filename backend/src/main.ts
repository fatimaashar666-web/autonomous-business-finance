import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/index.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);

  // ── Global prefix: every route starts with /api ────────────
  app.setGlobalPrefix('api');

  // ── CORS — allow the Vite dev server during development ────
  app.enableCors({
    origin: configService.get<string>('nodeEnv') === 'production'
      ? false
      : true,
  });

  // ── Validation pipe for DTO class-validator decorators ─────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Centralized error handling ─────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port);
  Logger.log(
    `🚀 Server running on http://localhost:${port}/api`,
    'Bootstrap',
  );
}

await bootstrap();
