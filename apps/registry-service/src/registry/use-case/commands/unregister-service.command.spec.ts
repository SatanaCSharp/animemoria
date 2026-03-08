import { Test } from '@nestjs/testing';
import { UnregisterServiceCommandProcessor } from 'registry/use-case/commands/unregister-service.command';
import { createUnregisterServiceCommandMock } from 'test/registry/mocks/use-case/unregister-service.command.mock';
import {
  createPinoLoggerMock,
  createPinoLoggerProvider,
} from 'test/shared/app-logger/pino-logger.mock';
import {
  createRegistryRepositoryMock,
  createRegistryRepositoryProvider,
} from 'test/shared/domain/repositories/registry-repository.mock';

describe('UnregisterServiceCommandProcessor', () => {
  let processor: UnregisterServiceCommandProcessor;
  let registryRepository: ReturnType<typeof createRegistryRepositoryMock>;
  let logger: ReturnType<typeof createPinoLoggerMock>;

  beforeEach(async () => {
    registryRepository = createRegistryRepositoryMock();
    logger = createPinoLoggerMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UnregisterServiceCommandProcessor,
        createRegistryRepositoryProvider(registryRepository),
        createPinoLoggerProvider(logger),
      ],
    }).compile();

    processor = moduleRef.get(UnregisterServiceCommandProcessor);
  });

  describe('process', () => {
    it('unregisters a service and logs completion', () => {
      const command = createUnregisterServiceCommandMock();

      processor.process(command);

      expect(registryRepository.removeServiceDescription).toHaveBeenCalledWith(
        command.appType,
        command.serviceId,
      );
      expect(logger.debug).toHaveBeenCalledWith(
        { appType: command.appType, serviceId: command.serviceId },
        'Processing unregister service command finished',
      );
    });
  });
});
