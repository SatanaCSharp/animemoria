import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppType,
  QueryProcessor,
  ServiceDescription,
  ServiceId,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'shared/domain/repositories/registry.repository';

type Query = {
  appType: AppType;
  serviceId: ServiceId;
};
@Injectable()
export class GetServiceDescriptionQueryProcessor implements QueryProcessor<
  Query,
  ServiceDescription
> {
  constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(GetServiceDescriptionQueryProcessor.name);
  }
  process(query: Query): ServiceDescription {
    const { appType, serviceId } = query;

    this.logger.debug(
      { appType, serviceId },
      'Processing get service description',
    );

    return this.registryRepository.getServiceDescription(appType, serviceId);
  }
}
