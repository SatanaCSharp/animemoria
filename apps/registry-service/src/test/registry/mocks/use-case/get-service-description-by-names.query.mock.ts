import { AppType } from '@packages/nest-shared/shared';

export const createGetServiceDescriptionByNamesQueryMock = (
  overrides?: Partial<{ appType: AppType; serviceNames: string[] }>,
) => ({
  appType: AppType.REST,
  serviceNames: ['service-a', 'service-b'],
  ...overrides,
});
