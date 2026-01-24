import { randomUUID } from 'node:crypto';

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemError } from '@packages/shared-types/errors';
import { Maybe } from '@packages/shared-types/utils';
import { assert, assertDefined } from '@packages/utils/asserts';
import { PinoLogger } from 'app-logger';
import { snakeCase } from 'lodash';
import { SERVICE_INITIALIZATION_OPTIONS } from 'registry-service/injections.token';
import { lastValueFrom } from 'rxjs';
import { AppType } from 'shared';
import {
  ServiceDescription,
  ServiceInitializationOptions,
} from 'shared/types/service-description';

@Injectable()
export class ModuleInitializerClientService {
  private serviceId: string = '';

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @Inject(SERVICE_INITIALIZATION_OPTIONS)
    private options: ServiceInitializationOptions,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ModuleInitializerClientService.name);
  }
  setServiceId(): void {
    this.serviceId = randomUUID();
  }

  private get registryServer(): string {
    return this.config.getOrThrow<string>('INTERNAL_REGISTRY_SERVER_HOST');
  }

  private get appName(): string {
    return this.config.getOrThrow<string>('APP_NAME');
  }

  private get appHost(): string {
    const envTransportPrefix = snakeCase(this.appName).toUpperCase();

    const envVarGrpcName = `${envTransportPrefix}_GRPC_URL`;
    const envVarRestName = `${envTransportPrefix}_REST_URL`;
    const envVarGraphqlName = `${envTransportPrefix}_GRAPHQL_URL`;

    const grpcHost = this.config.get<string>(envVarGrpcName);
    const restHost = this.config.get<string>(envVarRestName);
    const graphqlHost = this.config.get<string>(envVarGraphqlName);

    const hostMap = new Map<AppType, Maybe<string>>([
      [AppType.GQL, `${graphqlHost}/graphql`],
      [AppType.GRPC, grpcHost],
      [AppType.REST, restHost],
    ]);

    const { appType } = this.options;
    const host = hostMap.get(appType);

    assertDefined(
      host,
      new SystemError(`host for ${appType} has not been added`),
    );

    return host;
  }

  async register(): Promise<void> {
    const url = `${this.registryServer}/registry/${this.options.appType}/register`;

    const payload: ServiceDescription = {
      serviceName: this.appName,
      host: this.appHost,
      serviceId: this.serviceId,
    };
    await lastValueFrom(this.httpService.post(url, payload));

    this.logger.debug(payload, 'Registered service');
  }

  async unregister(): Promise<void> {
    assert(
      Boolean(this.serviceId),
      new SystemError('serviceId has not been registered'),
    );

    const url = `${this.registryServer}/registry/${this.options.appType}/unregister/${this.serviceId}`;
    await lastValueFrom(this.httpService.delete(url));

    this.logger.debug(this.serviceId, 'Unregistered service');
  }
}
