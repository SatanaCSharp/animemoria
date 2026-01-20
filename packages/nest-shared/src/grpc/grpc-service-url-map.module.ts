import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';
import { GrpcRegistryClientService } from 'grpc/grpc-registry.client-service';
import { ServiceDescription } from 'shared/types/service-description';

export const SERVICE_URL_MAP_TOKEN = Symbol('SERVICE_URL_MAP');

@Module({})
export class GrpcServiceUrlMapModule {
  static register(serviceNames: string[]): DynamicModule {
    const serviceUrlMapProvider = {
      provide: SERVICE_URL_MAP_TOKEN,
      inject: [GrpcRegistryClientService],
      useFactory: async (
        grpcRegistryClientService: GrpcRegistryClientService,
      ): Promise<Map<string, string>> => {
        const serviceDescriptions =
          await grpcRegistryClientService.getGrpcServiceDescriptionsByNames(
            serviceNames,
          );
        return this.createServiceUrlMap(serviceDescriptions);
      },
    };

    return {
      module: GrpcServiceUrlMapModule,
      imports: [HttpModule],
      providers: [GrpcRegistryClientService, serviceUrlMapProvider],
      exports: [SERVICE_URL_MAP_TOKEN],
    };
  }

  private static createServiceUrlMap(
    serviceDescriptions: ServiceDescription[],
  ): Map<string, string> {
    return new Map(
      serviceDescriptions.map((description) => [
        description.serviceName,
        description.host,
      ]),
    );
  }
}
