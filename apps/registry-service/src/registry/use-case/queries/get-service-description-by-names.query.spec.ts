import { Test } from '@nestjs/testing';
import { ServiceDescription } from '@packages/nest-shared/shared';
import { SystemError } from '@packages/shared-types/errors';
import { GetServiceDescriptionByNamesQueryProcessor } from 'registry/use-case/queries/get-service-description-by-names.query';
import { createGetServiceDescriptionByNamesQueryMock } from 'test/registry/mocks/use-case/get-service-description-by-names.query.mock';
import {
  createPinoLoggerMock,
  createPinoLoggerProvider,
} from 'test/shared/app-logger/pino-logger.mock';
import {
  createRegistryRepositoryMock,
  createRegistryRepositoryProvider,
} from 'test/shared/domain/repositories/registry-repository.mock';

describe('GetServiceDescriptionByNamesQueryProcessor', () => {
  let processor: GetServiceDescriptionByNamesQueryProcessor;
  let registryRepository: ReturnType<typeof createRegistryRepositoryMock>;
  let logger: ReturnType<typeof createPinoLoggerMock>;

  beforeEach(async () => {
    registryRepository = createRegistryRepositoryMock();
    logger = createPinoLoggerMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetServiceDescriptionByNamesQueryProcessor,
        createRegistryRepositoryProvider(registryRepository),
        createPinoLoggerProvider(logger),
      ],
    }).compile();

    processor = moduleRef.get(GetServiceDescriptionByNamesQueryProcessor);
  });

  describe('process', () => {
    it('returns service descriptions when all names are found', () => {
      const query = createGetServiceDescriptionByNamesQueryMock();
      const [a, b]: ServiceDescription[] = [
        { serviceId: 'a', serviceName: 'service-a', host: 'localhost' },
        { serviceId: 'b', serviceName: 'service-b', host: 'localhost' },
      ];

      registryRepository.getServiceDescriptionByServiceNames.mockReturnValue([
        a,
        b,
      ]);

      const result = processor.process(query);

      expect(logger.debug).toHaveBeenCalledWith(
        query.appType,
        'Processing get service description by name',
      );
      expect(
        registryRepository.getServiceDescriptionByServiceNames,
      ).toHaveBeenCalledWith(query.appType, query.serviceNames);
      expect(logger.debug).toHaveBeenCalledWith(
        query.appType,
        'Retrieving service descriptions finished',
      );
      expect(result).toEqual([a, b]);
    });

    it('throws when not all service names are found', () => {
      const query = createGetServiceDescriptionByNamesQueryMock({
        serviceNames: ['service-a', 'service-b'],
      });
      const onlyA: ServiceDescription[] = [
        { serviceId: 'a', serviceName: 'service-a', host: 'localhost' },
      ];

      registryRepository.getServiceDescriptionByServiceNames.mockReturnValue(
        onlyA,
      );

      expect(() => processor.process(query)).toThrow(SystemError);
    });
  });
});
