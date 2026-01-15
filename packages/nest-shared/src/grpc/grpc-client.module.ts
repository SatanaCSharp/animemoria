import { DynamicModule, Module } from '@nestjs/common';
import {
  ClientsModule,
  ClientsProviderAsyncOptions,
  Transport,
} from '@nestjs/microservices';
import {
  GrpcServiceUrlMapModule,
  SERVICE_URL_MAP_TOKEN,
} from 'grpc/grpc-service-url-map.module';
import { snakeCase } from 'lodash';
import { join } from 'path';

@Module({})
export class GrpcClientModule {
  static registerAsync(
    serviceNames: string[],
    isGlobal: boolean = false,
  ): DynamicModule {
    const clientProviders = serviceNames.map((serviceName) =>
      this.buildClientProviderOptions(serviceName),
    );

    return {
      global: isGlobal,
      module: GrpcClientModule,
      imports: [
        GrpcServiceUrlMapModule.register(serviceNames),
        ClientsModule.registerAsync({ clients: clientProviders }),
      ],
      exports: [ClientsModule],
    };
  }

  static forRootAsync(serviceNames: string[]) {
    return GrpcClientModule.registerAsync(serviceNames, true);
  }

  private static getProtoPath(serviceName: string) {
    const protoDirectory = 'node_modules/@packages/grpc/protobufs';
    return `${protoDirectory}/${serviceName}.proto`;
  }

  private static buildClientProviderOptions(
    serviceName: string,
  ): ClientsProviderAsyncOptions {
    const protoPath = this.getProtoPath(serviceName);
    const injectionToken = Symbol.for(`${snakeCase(serviceName)}_grpc_client`);

    return {
      inject: [SERVICE_URL_MAP_TOKEN],
      name: injectionToken,
      useFactory: (serviceUrlMap: Map<string, string>) => {
        const url = serviceUrlMap.get(serviceName)!;

        return {
          transport: Transport.GRPC,
          options: {
            package: serviceName,
            protoPath: join(__dirname, protoPath),
            url,
            loader: {
              defaults: true,
              objects: true,
              enums: String,
              oneofs: true,
              arrays: true,
            },
          },
        };
      },
    };
  }
}
