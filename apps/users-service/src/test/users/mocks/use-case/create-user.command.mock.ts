export const getCreatedUserMock = (
  overrides?: Partial<{
    id: string;
    email: string;
    nickname: string;
    accountId: string;
    createdAt: Date;
    updatedAt: Date;
  }>,
) => ({
  id: 'user-1',
  email: 'user@example.com',
  nickname: 'test-user',
  accountId: 'account-123',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const createCommandMock = (
  overrides?: Partial<{ email: string; nickname: string; accountId: string }>,
) => ({
  email: 'user@example.com',
  nickname: 'test-user',
  accountId: 'account-123',
  ...overrides,
});
