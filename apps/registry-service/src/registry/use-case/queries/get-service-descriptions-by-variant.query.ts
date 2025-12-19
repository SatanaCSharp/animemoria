import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppVariant,
  QueryProcessor,
  ServiceDescription,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'shared/domain/repositories/registry.repository';

type Query = {
  appVariant: AppVariant;
};
@Injectable()
export class GetServiceDescriptionsByVariantQueryProcessor implements QueryProcessor<
  Query,
  ServiceDescription[]
> {
  constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(GetServiceDescriptionsByVariantQueryProcessor.name);
  }
  process(query: Query): ServiceDescription[] {
    const { appVariant } = query;

    this.logger.debug('Processing get service descriptions', { appVariant });

    return this.registryRepository.getServiceDescriptions(appVariant);
  }
}
