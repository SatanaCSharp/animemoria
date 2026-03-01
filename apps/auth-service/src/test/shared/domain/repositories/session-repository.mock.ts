import { Account } from 'shared/domain/entities/account.entity';
import { Session } from 'shared/domain/entities/session.entity';
import { SessionRepository } from 'shared/domain/repositories/session.repository';
import { AppType } from 'shared/types/app-type.enum';

export type SessionRepositoryMock = jest.Mocked<SessionRepository>;

export const createSessionRepositoryMock = (
  overrides?: Partial<SessionRepositoryMock>,
): SessionRepositoryMock => {
  const base = {
    create: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
  };

  return {
    ...base,
    ...(overrides ?? {}),
  } as SessionRepositoryMock;
};

export const getSessionMock = (overrides?: Partial<Session>): Session => ({
  id: 'session-1',
  accountId: 'account-1',
  appType: AppType.WEB,
  refreshTokenHash: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  account: {} as Account,
  ...overrides,
});

export const createSessionRepositoryProvider = (
  mock: SessionRepositoryMock,
) => ({
  provide: SessionRepository,
  useValue: mock,
});
