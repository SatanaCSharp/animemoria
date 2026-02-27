import { RegistryRepository } from 'shared/domain/repositories/registry.repository';

export type RegistryRepositoryMock = jest.Mocked<RegistryRepository>;

export const createRegistryRepositoryMock = (
  overrides?: Partial<RegistryRepositoryMock>,
): RegistryRepositoryMock => {
  const base = {
    addAppTypeRegistry: jest.fn(),
    addServiceDescription: jest.fn(),
    removeServiceDescription: jest.fn(),
    getServiceDescriptions: jest.fn(),
    getServiceDescription: jest.fn(),
    getServiceDescriptionByServiceNames: jest.fn(),
    getServiceDescriptionByAppType: jest.fn(),
  };

  return {
    ...base,
    ...(overrides ?? {}),
  } as RegistryRepositoryMock;
};

export const createRegistryRepositoryProvider = (
  mock: RegistryRepositoryMock,
) => ({
  provide: RegistryRepository,
  useValue: mock,
});
