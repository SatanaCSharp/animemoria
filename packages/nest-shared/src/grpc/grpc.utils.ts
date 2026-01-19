import * as grpc from '@grpc/grpc-js';
import { PackageDefinition } from '@grpc/proto-loader';
import { ReflectionService } from '@grpc/reflection';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { snakeCase } from 'lodash';
import { join } from 'path';

export const getProtoPath = (serviceName: string): string => {
  const protoDirectory = 'node_modules/@packages/grpc/protobufs';
  return join(__dirname, `${protoDirectory}/${serviceName}.proto`);
};

export const getGrpcOptions = (serviceNames: string[]): GrpcOptions => {
  return {
    transport: Transport.GRPC,
    options: {
      package: serviceNames,
      protoPath: serviceNames.map(getProtoPath),
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
