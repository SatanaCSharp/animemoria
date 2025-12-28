import { NestFactory } from '@nestjs/core';
import { assertDefined } from '@packages/utils/asserts';
import { AppModule } from 'app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = process.env.APP_PORT;
  assertDefined(port, 'Port is required');

  await app.listen(port);
}

bootstrap().catch((err: unknown): unknown => err);
