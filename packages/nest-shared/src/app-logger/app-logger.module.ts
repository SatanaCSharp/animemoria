import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from 'config';
import { LoggerModule } from 'nestjs-pino';

@Module({})
export class AppLoggerModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: AppLoggerModule,
      imports: [
        LoggerModule.forRootAsync({
          imports: [ConfigModule.forRoot()],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const logPretty = config.getOrThrow<string>('LOG_PRETTY');
            const nodeEnv = config.getOrThrow<string>('NODE_ENV');
            const logLevel = config.getOrThrow<string>('LOG_LEVEL');

            const isPretty = logPretty === 'true' || nodeEnv !== 'production';

            const transportOptions = {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            };

            return {
              pinoHttp: {
                level: logLevel,
                transport: isPretty ? transportOptions : undefined,
              },
            };
          },
        }),
      ],
      exports: [LoggerModule],
    };
  }
}
