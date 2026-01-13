import pino, { Logger } from 'pino';

interface LoggerConfig {
  level?: string;
  pretty?: boolean;
}

const createTransportConfig = (
  pretty: boolean,
):
  | {
      target: string;
      options: {
        colorize: boolean;
        translateTime: string;
        ignore: string;
        singleLine: boolean;
      };
    }
  | undefined =>
  pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined;

const getLoggerConfig = (): LoggerConfig => ({
  level: process.env.LOG_LEVEL || 'info',
  pretty: process.env.LOG_PRETTY === 'true',
});

export const createMigrationLogger = (): Logger => {
  const config = getLoggerConfig();
  const transport = createTransportConfig(config.pretty ?? false);

  return pino({
    level: config.level ?? 'info',
    ...(transport && { transport }),
  });
};
