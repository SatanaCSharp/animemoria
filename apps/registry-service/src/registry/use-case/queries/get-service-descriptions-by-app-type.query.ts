import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppType,
  QueryProcessor,
  ServiceDescription,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'shared/domain/repositories/registry.repository';

type Query = {
  appType: AppType;
};
@Injectable()
export class GetServiceDescriptionsByAppTypeQueryProcessor implements QueryProcessor<
  Query,
  ServiceDescription[]
> {
  constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(GetServiceDescriptionsByAppTypeQueryProcessor.name);
  }
  process(query: Query): ServiceDescription[] {
    const { appType } = query;

    this.logger.debug('Processing get service descriptions', { appType });

    return this.registryRepository.getServiceDescriptions(appType);
  }
}
