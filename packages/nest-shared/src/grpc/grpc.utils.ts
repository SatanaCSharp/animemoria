import * as grpc from '@grpc/grpc-js';
import { PackageDefinition } from '@grpc/proto-loader';
import { ReflectionService } from '@grpc/reflection';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { snakeCase } from 'lodash';
import { join } from 'path';

export const getProtoPath = (serviceName: string): string => {
  const protobufsPath = 'node_modules/@packages/grpc/protobufs';
  return join(process.cwd(), protobufsPath, `${snakeCase(serviceName)}.proto`);
};

/**
 * Creates gRPC server options that include both the service proto and the health proto.
 * Health proto is included by default to support HealthModule with AppType.GRPC.
 *
 * @param serviceName - The service name (e.g., 'users-service')
 * @param url - The gRPC server URL (e.g., '0.0.0.0:5000')
 * @returns GrpcOptions configured with both service and health protos
 *
 * @example
 * const app = await NestFactory.createMicroservice<MicroserviceOptions>(
 *   GrpcModule,
 *   getServerGrpcOption('users-service', url),
 * );
 */

export const getServerGrpcOption = (
  serviceName: string,
  url: string,
): GrpcOptions => {
  const healthPackageName = 'grpc.health.v1';
  const healthServiceName = 'health';

  return {
    transport: Transport.GRPC,
    options: {
      package: [snakeCase(serviceName), healthPackageName],
      protoPath: [getProtoPath(serviceName), getProtoPath(healthServiceName)],
      url,
      onLoadPackageDefinition: (
        pkg: PackageDefinition,
        server: Pick<grpc.Server, 'addService'>,
      ) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  };
};

export const getGrpcServiceInjectionToken = (serviceName: string): string =>
  `${snakeCase(serviceName)}_grpc_injection_token`;
