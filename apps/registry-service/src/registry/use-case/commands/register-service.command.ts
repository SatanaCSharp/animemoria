import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppVariant,
  CommandProcessor,
  ServiceDescription,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'shared/domain/repositories/registry.repository';

type Command = {
  appVariant: AppVariant;
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
    const { serviceDescription, appVariant } = command;

    this.registryRepository.addAppVariantRegistry(appVariant);

    this.registryRepository.addServiceDescription(
      appVariant,
      serviceDescription,
    );

    this.logger.debug(
      serviceDescription,
      'Service registration completed successfully',
    );
  }
}
