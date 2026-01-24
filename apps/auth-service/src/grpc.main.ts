import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { getServerGrpcOption } from '@packages/nest-shared/grpc';
import { assertDefined } from '@packages/utils/asserts';
import { GrpcModule } from 'grpc.module';

async function bootstrap(): Promise<void> {
  const url = process.env.AUTH_SERVICE_GRPC_URL;

  assertDefined(url, 'AUTH_SERVICE_GRPC_URL is required');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    GrpcModule,
    getServerGrpcOption('auth-service', url),
  );

  await app.listen();

  app.enableShutdownHooks();
}

bootstrap().catch((err: unknown): unknown => err);
