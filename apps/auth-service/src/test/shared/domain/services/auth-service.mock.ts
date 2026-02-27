import { AuthService, TokenPair } from 'shared/domain/services/auth.service';

export type AuthServiceMock = jest.Mocked<Pick<AuthService, 'getTokens'>>;

export const createAuthServiceMock = (
  overrides?: Partial<AuthServiceMock>,
): AuthServiceMock => ({
  getTokens: jest.fn(),
  ...overrides,
});

export const getTokenPairMock = (
  overrides?: Partial<TokenPair>,
): TokenPair => ({
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  ...overrides,
});

export const createAuthServiceProvider = (mock: AuthServiceMock) => ({
  provide: AuthService,
  useValue: mock,
});
