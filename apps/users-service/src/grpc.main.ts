import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { getGrpcOptions } from '@packages/nest-shared/grpc';
import { assertDefined } from '@packages/utils/asserts';
import { GrpcModule } from 'grpc.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(GrpcModule);
  app.connectMicroservice<MicroserviceOptions>(
    getGrpcOptions(['users-service']),
  );
  await app.startAllMicroservices();

  const port = process.env.APP_GRPC_PORT;

  assertDefined(port, 'Port is required');

  await app.listen(port);

  app.enableShutdownHooks();
}

bootstrap().catch((err: unknown): unknown => err);
