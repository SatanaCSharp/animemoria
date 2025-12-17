import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppVariant,
  CommandProcessor,
  ServiceId,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'modules/shared/domain/repositories/registry.repository';

type Command = {
  appVariant: AppVariant;
  serviceId: ServiceId;
};

@Injectable()
export class UnregisterServiceCommandProcessor implements CommandProcessor<
  Command,
  void
> {
  constructor(
    private readonly registryRepository: RegistryRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UnregisterServiceCommandProcessor.name);
  }
  process(command: Command): void {
    const { appVariant, serviceId } = command;

    this.registryRepository.removeServiceDescription(appVariant, serviceId);

    this.logger.debug(
      { appVariant, serviceId },
      'Processing unregister service command finished',
    );
  }
}
