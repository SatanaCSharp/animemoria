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

export const getServerGrpcOption = (
  serviceName: string,
  url: string,
): GrpcOptions => {
  return {
    transport: Transport.GRPC,
    options: {
      package: snakeCase(serviceName),
      protoPath: getProtoPath(serviceName),
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
