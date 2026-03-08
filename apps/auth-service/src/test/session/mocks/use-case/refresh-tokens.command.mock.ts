export const createRefreshTokensCommandMock = (
  overrides?: Partial<{
    accountId: string;
    sessionId: string;
    oldRefreshToken: string;
  }>,
) => ({
  accountId: 'account-1',
  sessionId: 'session-1',
  oldRefreshToken: 'old-refresh-token',
  ...overrides,
});
