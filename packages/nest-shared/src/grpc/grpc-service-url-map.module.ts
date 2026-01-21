import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';
import { SystemError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { PinoLogger } from 'app-logger';
import { GrpcRegistryClientService } from 'grpc/grpc-registry.client-service';
import { ServiceDescription } from 'shared/types/service-description';

export const SERVICE_URL_MAP_TOKEN = 'SERVICE_URL_MAP';

@Module({})
export class GrpcServiceUrlMapModule {
  static register(serviceNames: string[]): DynamicModule {
    const serviceUrlMapProvider = {
      provide: SERVICE_URL_MAP_TOKEN,
      inject: [GrpcRegistryClientService, PinoLogger],
      useFactory: async (
        grpcRegistryClientService: GrpcRegistryClientService,
        logger: PinoLogger,
      ): Promise<Map<string, string>> => {
        try {
          const serviceDescriptions =
            await grpcRegistryClientService.getGrpcServiceDescriptionsByNames(
              serviceNames,
            );
          return this.createServiceUrlMap(serviceDescriptions);
        } catch (err: unknown) {
          logger.error('GrpcServiceUrlMapModule Service Error', err);
          assertFail(new SystemError('createServiceUrlMap operation failed'));
        }
      },
    };

    return {
      global: true,
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
