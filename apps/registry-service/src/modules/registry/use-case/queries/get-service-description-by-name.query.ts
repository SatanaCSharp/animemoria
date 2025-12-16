import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppVariant,
  QueryProcessor,
  ServiceDescription,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'modules/shared/domain/repositories/registry.repository';

type Query = {
  appVariant: AppVariant;
  serviceName: string;
};
@Injectable()
export class GetServiceDescriptionByNameQueryProcessor implements QueryProcessor<
  Query,
  ServiceDescription
> {
  constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(GetServiceDescriptionByNameQueryProcessor.name);
  }
  process(query: Query): ServiceDescription {
    const { appVariant, serviceName } = query;

    this.logger.debug('Processing get service description by name', {
      appVariant,
    });

    return this.registryRepository.getServiceDescriptionByServiceName(
      appVariant,
      serviceName,
    );
  }
}
