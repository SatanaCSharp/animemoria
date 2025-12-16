import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppVariant,
  CommandProcessor,
  ServiceDescription,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'modules/shared/domain/repositories/registry.repository';

type Command = {
  serviceDescription: ServiceDescription;
};

@Injectable()
export class RegisterServiceCommandProcessor implements CommandProcessor<
  Command,
  void
> {
  constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RegisterServiceCommandProcessor.name);
  }

  process(command: Command): void {
    const { serviceDescription } = command;

    this.logger.debug('Processing register service command', {
      serviceDescription,
    });

    this.registryRepository.addAppVariantRegistry(
      serviceDescription.appVariant as AppVariant,
    );

    this.logger.debug('Adding service description to registry', {
      serviceName: serviceDescription.serviceName,
      serviceId: serviceDescription.serviceId,
    });

    this.registryRepository.addServiceDescription(serviceDescription);

    this.logger.debug('Service registration completed successfully');
  }
}
