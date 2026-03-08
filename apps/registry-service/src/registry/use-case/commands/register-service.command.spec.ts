import { Test } from '@nestjs/testing';
import { RegisterServiceCommandProcessor } from 'registry/use-case/commands/register-service.command';
import { createRegisterServiceCommandMock } from 'test/registry/mocks/use-case/register-service.command.mock';
import {
  createPinoLoggerMock,
  createPinoLoggerProvider,
} from 'test/shared/app-logger/pino-logger.mock';
import {
  createRegistryRepositoryMock,
  createRegistryRepositoryProvider,
} from 'test/shared/domain/repositories/registry-repository.mock';

describe('RegisterServiceCommandProcessor', () => {
  let processor: RegisterServiceCommandProcessor;
  let registryRepository: ReturnType<typeof createRegistryRepositoryMock>;
  let logger: ReturnType<typeof createPinoLoggerMock>;

  beforeEach(async () => {
    registryRepository = createRegistryRepositoryMock();
    logger = createPinoLoggerMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        RegisterServiceCommandProcessor,
        createRegistryRepositoryProvider(registryRepository),
        createPinoLoggerProvider(logger),
      ],
    }).compile();

    processor = moduleRef.get(RegisterServiceCommandProcessor);
  });

  describe('process', () => {
    it('registers a service and logs start and completion', () => {
      const command = createRegisterServiceCommandMock();

      processor.process(command);

      expect(logger.debug).toHaveBeenCalledWith(
        command,
        'Service registration start',
      );
      expect(registryRepository.addAppTypeRegistry).toHaveBeenCalledWith(
        command.appType,
      );
      expect(registryRepository.addServiceDescription).toHaveBeenCalledWith(
        command.appType,
        command.serviceDescription,
      );
      expect(logger.debug).toHaveBeenCalledWith(
        {
          appType: command.appType,
          serviceDescription: command.serviceDescription,
        },
        'Service registration completed successfully',
      );
    });
  });
});
