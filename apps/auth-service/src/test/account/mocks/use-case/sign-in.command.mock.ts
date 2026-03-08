import { AppType } from 'shared/types/app-type.enum';

export const createSignInCommandMock = (
  overrides?: Partial<{ email: string; password: string; appType: AppType }>,
) => ({
  email: 'user@example.com',
  password: 'plain-password',
  appType: AppType.WEB,
  ...overrides,
});
