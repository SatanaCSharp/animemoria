import { Injectable } from '@nestjs/common';
import { QueryProcessor } from '@packages/nest-shared/shared';
import { SystemError } from '@packages/shared-types/errors';
import { assertDefined } from '@packages/utils/asserts';
import { RegistryClientService } from 'shared/client-services/registry.client-service';

type SubgraphService = {
  name: string;
  url: string;
};

@Injectable()
export class GetSubgraphServicesQueryProcessor implements QueryProcessor<
  void,
  SubgraphService[]
> {
  constructor(private readonly registryClientService: RegistryClientService) {}

  async process(): Promise<SubgraphService[]> {
    const serviceDescriptions =
      await this.registryClientService.getGraphQlServiceDescriptions();

    assertDefined(
      serviceDescriptions,
      new SystemError('Service descriptions not found'),
    );

    return serviceDescriptions.map((serviceDescription) => ({
      name: serviceDescription.serviceName,
      url: serviceDescription.host,
    }));
  }
}
