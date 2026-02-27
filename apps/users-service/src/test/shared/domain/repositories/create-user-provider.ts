import { UserRepository } from 'shared/domain/repositories/user.repository';

export type UserRepositoryMock = jest.Mocked<UserRepository>;

export const createUserRepositoryMock = (
  overrides?: Partial<UserRepositoryMock>,
): UserRepositoryMock => {
  const base = {
    create: jest.fn(),
  };

  return {
    ...base,
    ...(overrides ?? {}),
  } as UserRepositoryMock;
};

export const createUserRepositoryProvider = (mock: UserRepositoryMock) => ({
  provide: UserRepository,
  useValue: mock,
});
