import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({})
export class ConfigModule {
  static forRoot(): DynamicModule {
    return {
      global: true,
      module: ConfigModule,
      imports: [
        NestConfigModule.forRoot({
          envFilePath: process.env.DOTENV_CONFIG_PATH ?? '.env',
          isGlobal: true,
          expandVariables: true,
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}
