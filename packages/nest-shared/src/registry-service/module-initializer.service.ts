import { randomUUID } from 'node:crypto';

import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
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
    @Inject(SERVICE_INITIALIZATION_OPTIONS)
    private options: ServiceInitializationOptions,
  ) {}

  setServiceId(): void {
    this.serviceId = randomUUID();
  }

  async register(): Promise<void> {
    const url = `${this.options.registryServer}/registry/register/${this.options.serviceName}`;

    const payload: ServiceDescription = {
      appVariant: this.options.appVariant,
      serviceName: this.options.serviceName,
      host: this.options.host,
      serviceId: this.serviceId,
    };

    await lastValueFrom(this.httpService.post(url, payload));
  }

  async unregister(): Promise<void> {
    if (!this.serviceId) {
      return;
    }

    const url = `${this.options.registryServer}/registry/unregister/${this.serviceId}`;

    await lastValueFrom(this.httpService.post(url));
  }
}
