import { Test } from '@nestjs/testing';
import { GetServiceDescriptionQueryProcessor } from 'registry/use-case/queries/get-service-description.query';
import {
  createGetServiceDescriptionQueryMock,
  getServiceDescriptionMock,
} from 'test/registry/mocks/use-case/get-service-description.query.mock';
import {
  createPinoLoggerMock,
  createPinoLoggerProvider,
} from 'test/shared/app-logger/pino-logger.mock';
import {
  createRegistryRepositoryMock,
  createRegistryRepositoryProvider,
} from 'test/shared/domain/repositories/registry-repository.mock';

describe('GetServiceDescriptionQueryProcessor', () => {
  let processor: GetServiceDescriptionQueryProcessor;
  let registryRepository: ReturnType<typeof createRegistryRepositoryMock>;
  let logger: ReturnType<typeof createPinoLoggerMock>;

  beforeEach(async () => {
    registryRepository = createRegistryRepositoryMock();
    logger = createPinoLoggerMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetServiceDescriptionQueryProcessor,
        createRegistryRepositoryProvider(registryRepository),
        createPinoLoggerProvider(logger),
      ],
    }).compile();

    processor = moduleRef.get(GetServiceDescriptionQueryProcessor);
  });

  describe('process', () => {
    it('retrieves service description from repository and logs processing', () => {
      const query = createGetServiceDescriptionQueryMock();
      const description = getServiceDescriptionMock();
      registryRepository.getServiceDescription.mockReturnValue(description);

      const result = processor.process(query);

      expect(logger.debug).toHaveBeenCalledWith(
        { appType: query.appType, serviceId: query.serviceId },
        'Processing get service description',
      );
      expect(registryRepository.getServiceDescription).toHaveBeenCalledWith(
        query.appType,
        query.serviceId,
      );
      expect(result).toEqual(description);
    });
  });
});
