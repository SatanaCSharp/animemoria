import { Injectable } from '@nestjs/common';
import { PinoLogger } from '@packages/nest-shared/app-logger';
import {
  AppType,
  CommandProcessor,
  ServiceId,
} from '@packages/nest-shared/shared';
import { RegistryRepository } from 'shared/domain/repositories/registry.repository';

type Command = {
  appType: AppType;
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
    const { appType, serviceId } = command;

    this.registryRepository.removeServiceDescription(appType, serviceId);

    this.logger.debug(
      { appType, serviceId },
      'Processing unregister service command finished',
    );
  }
}
