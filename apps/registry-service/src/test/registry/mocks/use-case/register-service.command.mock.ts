import { AppType, ServiceDescription } from '@packages/nest-shared/shared';

export const getServiceDescriptionMock = (
  overrides?: Partial<ServiceDescription>,
): ServiceDescription => ({
  serviceId: 'service-1',
  serviceName: 'test-service',
  host: 'localhost',
  ...overrides,
});

export const createRegisterServiceCommandMock = (
  overrides?: Partial<{
    appType: AppType;
    serviceDescription: ServiceDescription;
  }>,
) => ({
  appType: AppType.REST,
  serviceDescription: getServiceDescriptionMock(),
  ...overrides,
});
