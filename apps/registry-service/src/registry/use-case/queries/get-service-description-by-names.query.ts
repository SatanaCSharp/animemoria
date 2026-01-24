import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppType,
  QueryProcessor,
  ServiceDescription,
} from '@packages/nest-shared/shared';
import { SystemError } from '@packages/shared-types/errors';
import { assert } from '@packages/utils/asserts';
import { RegistryRepository } from 'shared/domain/repositories/registry.repository';

type Query = {
  appType: AppType;
  serviceNames: string[];
};
@Injectable()
export class GetServiceDescriptionByNamesQueryProcessor implements QueryProcessor<
  Query,
  ServiceDescription[]
> {
  constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(GetServiceDescriptionByNamesQueryProcessor.name);
  }

  process(query: Query): ServiceDescription[] {
    const { appType, serviceNames } = query;

    this.logger.debug(appType, 'Processing get service description by name');

    const serviceDescriptions =
      this.registryRepository.getServiceDescriptionByServiceNames(
        appType,
        serviceNames,
      );

    const areAllServiceFound =
      serviceDescriptions.length === serviceNames.length;

    assert(
      areAllServiceFound,
      new SystemError(
        `Inconsistent result for serviceNames: ${serviceNames.join(', ')}`,
      ),
    );
    this.logger.debug(appType, 'Retrieving service descriptions finished');

    return serviceDescriptions;
  }
}
