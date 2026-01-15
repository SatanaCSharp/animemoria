import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppType,
  QueryProcessor,
  ServiceDescription,
} from '@packages/nest-shared/shared';
import { SystemError } from '@packages/shared-types/errors';
import { assertDefined } from '@packages/utils/asserts';
import { lastValueFrom } from 'rxjs';

type SubgraphService = {
  name: string;
  url: string;
};

@Injectable()
export class GetSubgraphServicesQueryProcessor implements QueryProcessor<
  void,
  SubgraphService[]
> {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private get registryServer(): string {
    return this.config.getOrThrow<string>('INTERNAL_REGISTRY_SERVER_HOST');
  }

  async process(): Promise<SubgraphService[]> {
    const url = `${this.registryServer}/registry/${AppType.GQL}`;

    const { data } = await lastValueFrom(
      this.httpService.get<{
        serviceDescriptions: ServiceDescription[];
      }>(url),
    );

    assertDefined(
      data?.serviceDescriptions,
      new SystemError('Service descriptions not found'),
    );

    return data.serviceDescriptions.map((serviceDescription) => ({
      name: serviceDescription.serviceName,
      url: serviceDescription.host,
    }));
  }
}
