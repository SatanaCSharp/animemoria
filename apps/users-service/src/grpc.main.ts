import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { getServerGrpcOption } from '@packages/nest-shared/grpc';
import { assertDefined } from '@packages/utils/asserts';
import { GrpcModule } from 'grpc.module';

async function bootstrap(): Promise<void> {
  const port = process.env.APP_GRPC_PORT;

  assertDefined(port, 'APP_GRPC_PORT is required');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    GrpcModule,
    getServerGrpcOption('users-service', `0.0.0.0:${port}`),
  );

  await app.listen();

  app.enableShutdownHooks();
}

bootstrap().catch((err: unknown): unknown => err);
