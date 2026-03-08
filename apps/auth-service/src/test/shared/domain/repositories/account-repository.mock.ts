import { AccountStatus } from '@packages/shared-types/enums';
import { Account } from 'shared/domain/entities/account.entity';
import { AccountRepository } from 'shared/domain/repositories/account.repository';

export type AccountRepositoryMock = jest.Mocked<AccountRepository>;

export const createAccountRepositoryMock = (
  overrides?: Partial<AccountRepositoryMock>,
): AccountRepositoryMock => {
  const base = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  return {
    ...base,
    ...(overrides ?? {}),
  } as AccountRepositoryMock;
};

export const getActiveAccountMock = (
  overrides?: Partial<Account>,
): Account => ({
  id: 'account-1',
  email: 'user@example.com',
  status: AccountStatus.ACTIVE,
  password: 'hashed-password',
  sessions: [],
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

export const createAccountRepositoryProvider = (
  mock: AccountRepositoryMock,
) => ({
  provide: AccountRepository,
  useValue: mock,
});
