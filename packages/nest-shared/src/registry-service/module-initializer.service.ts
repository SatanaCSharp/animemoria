import { randomUUID } from 'node:crypto';

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SystemError } from '@packages/shared-types/errors';
import { assert } from '@packages/utils/asserts';
import { PinoLogger } from 'app-logger';
import { SERVICE_INITIALIZATION_OPTIONS } from 'registry-service/injections.token';
import { lastValueFrom } from 'rxjs';
import {
  ServiceDescription,
  ServiceInitializationOptions,
} from 'shared/types/service-description';

@Injectable()
export class ModuleInitializerService {
  private serviceId: string = '';

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    @Inject(SERVICE_INITIALIZATION_OPTIONS)
    private options: ServiceInitializationOptions,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ModuleInitializerService.name);
  }
  setServiceId(): void {
    this.serviceId = randomUUID();
  }

  private get registryServer(): string {
    return this.config.getOrThrow<string>('INTERNAL_REGISTRY_SERVER_HOST');
  }

  async register(): Promise<void> {
    const url = `${this.registryServer}/registry/${this.options.appVariant}/register`;

    // TODO ADD automatic registration services from env variables, based on variant
    const payload: ServiceDescription = {
      serviceName: this.options.serviceName,
      host: this.options.host,
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

    const url = `${this.registryServer}/registry/${this.options.appVariant}/unregister/${this.serviceId}`;
    await lastValueFrom(this.httpService.delete(url));

    this.logger.debug(this.serviceId, 'Unregistered service');
  }
}
