import { PinoLogger } from '@packages/nest-shared/app-logger';

export type PinoLoggerMock = jest.Mocked<PinoLogger>;

export const createPinoLoggerMock = (
  overrides?: Partial<PinoLoggerMock>,
): PinoLoggerMock => {
  const base = {
    setContext: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
  };

  return {
    ...base,
    ...(overrides ?? {}),
  } as unknown as PinoLoggerMock;
};

export const createPinoLoggerProvider = (mock: PinoLoggerMock) => ({
  provide: PinoLogger,
  useValue: mock,
});
