import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppType,
  CommandProcessor,
  ServiceDescription,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'shared/domain/repositories/registry.repository';

type Command = {
  appType: AppType;
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
    const { serviceDescription, appType } = command;

    this.registryRepository.addAppTypeRegistry(appType);

    this.registryRepository.addServiceDescription(appType, serviceDescription);

    this.logger.debug(
      serviceDescription,
      'Service registration completed successfully',
    );
  }
}
