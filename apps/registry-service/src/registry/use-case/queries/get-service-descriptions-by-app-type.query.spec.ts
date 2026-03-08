import { Test } from '@nestjs/testing';
import { ServiceDescription } from '@packages/nest-shared/shared';
import { GetServiceDescriptionsByAppTypeQueryProcessor } from 'registry/use-case/queries/get-service-descriptions-by-app-type.query';
import { createGetServiceDescriptionsByAppTypeQueryMock } from 'test/registry/mocks/use-case/get-service-descriptions-by-app-type.query.mock';
import {
  createPinoLoggerMock,
  createPinoLoggerProvider,
} from 'test/shared/app-logger/pino-logger.mock';
import {
  createRegistryRepositoryMock,
  createRegistryRepositoryProvider,
} from 'test/shared/domain/repositories/registry-repository.mock';

describe('GetServiceDescriptionsByAppTypeQueryProcessor', () => {
  let processor: GetServiceDescriptionsByAppTypeQueryProcessor;
  let registryRepository: ReturnType<typeof createRegistryRepositoryMock>;
  let logger: ReturnType<typeof createPinoLoggerMock>;

  beforeEach(async () => {
    registryRepository = createRegistryRepositoryMock();
    logger = createPinoLoggerMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetServiceDescriptionsByAppTypeQueryProcessor,
        createRegistryRepositoryProvider(registryRepository),
        createPinoLoggerProvider(logger),
      ],
    }).compile();

    processor = moduleRef.get(GetServiceDescriptionsByAppTypeQueryProcessor);
  });

  describe('process', () => {
    it('returns service descriptions for a given app type', () => {
      const query = createGetServiceDescriptionsByAppTypeQueryMock();
      const descriptions: ServiceDescription[] = [
        { serviceId: 'a', serviceName: 'service-a', host: 'localhost' },
      ];

      registryRepository.getServiceDescriptions.mockReturnValue(descriptions);

      const result = processor.process(query);

      expect(logger.debug).toHaveBeenCalledWith(
        'Processing get service descriptions',
        { appType: query.appType },
      );
      expect(registryRepository.getServiceDescriptions).toHaveBeenCalledWith(
        query.appType,
      );
      expect(result).toEqual(descriptions);
    });
  });
});
