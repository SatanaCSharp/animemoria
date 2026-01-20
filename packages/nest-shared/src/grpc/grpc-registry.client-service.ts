import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemError } from '@packages/shared-types/errors';
import { assertDefined } from '@packages/utils/asserts';
import { lastValueFrom } from 'rxjs';
import { AppType, ServiceDescription } from 'shared';

@Injectable()
export class GrpcRegistryClientService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private get registryServer(): string {
    return this.config.getOrThrow<string>('INTERNAL_REGISTRY_SERVER_HOST');
  }

  async getGrpcServiceDescriptionsByNames(
    serviceNames: string[],
  ): Promise<ServiceDescription[]> {
    const url = `${this.registryServer}/registry/${AppType.GRPC}/service-descriptions/service-names/${serviceNames.join(',')}`;

    const { data } = await lastValueFrom(
      this.httpService.get<{ serviceDescriptions: ServiceDescription[] }>(url),
    );

    assertDefined(
      data?.serviceDescriptions,
      new SystemError('serviceDescriptions has not been retrieved'),
    );

    return data.serviceDescriptions;
  }
}
