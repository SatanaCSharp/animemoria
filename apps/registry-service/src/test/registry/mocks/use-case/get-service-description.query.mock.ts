import {
  AppType,
  ServiceDescription,
  ServiceId,
} from '@packages/nest-shared/shared';

export const createGetServiceDescriptionQueryMock = (
  overrides?: Partial<{ appType: AppType; serviceId: ServiceId }>,
) => ({
  appType: AppType.REST,
  serviceId: 'service-1' as ServiceId,
  ...overrides,
});

export const getServiceDescriptionMock = (
  overrides?: Partial<ServiceDescription>,
): ServiceDescription => ({
  serviceId: 'service-1',
  serviceName: 'test-service',
  host: 'localhost',
  ...overrides,
});
