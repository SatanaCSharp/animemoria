import { AccountStatus } from '@packages/shared-types/enums';
import { Account } from 'shared/domain/entities/account.entity';
import { Session } from 'shared/domain/entities/session.entity';
import { AppType } from 'shared/types/app-type.enum';

export const createSignUpCommandMock = (
  overrides?: Partial<{ nickname: string; email: string; password: string }>,
) => ({
  nickname: 'test-user',
  email: 'user@example.com',
  password: 'plain-password',
  ...overrides,
});

export const getCreatedAccountMock = (
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

export const getCreatedSessionMock = (
  overrides?: Partial<Session>,
): Session => ({
  id: 'session-1',
  accountId: 'account-1',
  appType: AppType.WEB,
  refreshTokenHash: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  account: {} as Account,
  ...overrides,
});
