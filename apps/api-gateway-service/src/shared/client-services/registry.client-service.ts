import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppType, ServiceDescription } from '@packages/nest-shared/shared';
import { Maybe } from '@packages/shared-types/utils';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RegistryClientService {
  constructor(
    private readonly config: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private get registryServer(): string {
    return this.config.getOrThrow<string>('INTERNAL_REGISTRY_SERVER_HOST');
  }

  async getGraphQlServiceDescriptions(): Promise<Maybe<ServiceDescription[]>> {
    const url = `${this.registryServer}/registry/${AppType.GQL}`;

    const { data } = await lastValueFrom(
      this.httpService.get<{
        serviceDescriptions: ServiceDescription[];
      }>(url),
    );

    return data?.serviceDescriptions;
  }
}
