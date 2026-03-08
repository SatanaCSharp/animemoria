import { UsersClientService } from 'shared/client-services/users.client-service';

export type UsersClientServiceMock = jest.Mocked<UsersClientService>;

export const createUsersClientServiceMock = (
  overrides?: Partial<UsersClientServiceMock>,
): UsersClientServiceMock => {
  const base = {
    createUser: jest.fn(),
  };

  return {
    ...base,
    ...(overrides ?? {}),
  } as UsersClientServiceMock;
};

export const createUsersClientServiceProvider = (
  mock: UsersClientServiceMock,
) => ({
  provide: UsersClientService,
  useValue: mock,
});
