import { NestFactory } from '@nestjs/core';
import { assertDefined } from '@packages/utils/asserts';
import cookieParser from 'cookie-parser';
import { GraphqlModule } from 'graphql.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(GraphqlModule);
  app.use(cookieParser());
  const port = process.env.APP_PORT;

  assertDefined(port, 'Port is required');

  await app.listen(port);

  app.enableShutdownHooks();
}

bootstrap().catch((err: unknown): unknown => err);
