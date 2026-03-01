import { AppType } from '@packages/nest-shared/shared';

export const createGetServiceDescriptionsByAppTypeQueryMock = (
  overrides?: Partial<{ appType: AppType }>,
) => ({
  appType: AppType.REST,
  ...overrides,
});
