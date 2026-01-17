import { NestFactory } from '@nestjs/core';
import { assertDefined } from '@packages/utils/asserts';
import { RestModule } from 'rest.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(RestModule);
  const port = process.env.APP_PORT;
  assertDefined(port, 'Port is required');

  await app.listen(port);
}

bootstrap().catch((err: unknown): unknown => err);
