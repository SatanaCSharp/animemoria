import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppVariant,
  QueryProcessor,
  ServiceDescription,
  ServiceId,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'modules/shared/domain/repositories/registry.repository';

type Query = {
  appVariant: AppVariant;
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
    const { appVariant, serviceId } = query;

    this.logger.debug(
      { appVariant, serviceId },
      'Processing get service description',
    );

    return this.registryRepository.getServiceDescription(appVariant, serviceId);
  }
}
