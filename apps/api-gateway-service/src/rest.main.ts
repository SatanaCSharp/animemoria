import { NestFactory } from '@nestjs/core';
import { assertDefined } from '@packages/utils/asserts';
import cookieParser from 'cookie-parser';
import { RestModule } from 'rest.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(RestModule);
  const port = process.env.APP_REST_PORT;

  assertDefined(port, 'Port is required');

  // Configure CORS
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const corsOrigins = isDevelopment
    ? '*' // Allow all origins in development
    : process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) || [];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Apollo-Require-Preflight',
    ],
  });

  app.use(cookieParser());

  await app.listen(port);

  app.enableShutdownHooks();
}

bootstrap().catch((err: unknown): unknown => err);
