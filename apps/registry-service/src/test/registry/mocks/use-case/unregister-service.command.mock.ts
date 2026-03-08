import { AppType, ServiceId } from '@packages/nest-shared/shared';

export const createUnregisterServiceCommandMock = (
  overrides?: Partial<{ appType: AppType; serviceId: ServiceId }>,
) => ({
  appType: AppType.REST,
  serviceId: 'service-1' as ServiceId,
  ...overrides,
});
