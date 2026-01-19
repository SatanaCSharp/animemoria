import { DynamicModule, Module } from '@nestjs/common';
import {
  ClientsModule,
  ClientsProviderAsyncOptions,
  Transport,
} from '@nestjs/microservices';
import { getGrpcServiceInjectionToken, getProtoPath } from 'grpc/grpc.utils';
import {
  GrpcServiceUrlMapModule,
  SERVICE_URL_MAP_TOKEN,
} from 'grpc/grpc-service-url-map.module';

@Module({})
export class GrpcClientModule {
  static register(
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

  static forRoot(serviceNames: string[]) {
    return GrpcClientModule.register(serviceNames, true);
  }

  private static buildClientProviderOptions(
    serviceName: string,
  ): ClientsProviderAsyncOptions {
    const injectionToken = getGrpcServiceInjectionToken(serviceName);

    return {
      inject: [SERVICE_URL_MAP_TOKEN],
      name: injectionToken,
      useFactory: (serviceUrlMap: Map<string, string>) => {
        const url = serviceUrlMap.get(serviceName)!;

        return {
          transport: Transport.GRPC,
          options: {
            package: serviceName,
            protoPath: getProtoPath(serviceName),
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
