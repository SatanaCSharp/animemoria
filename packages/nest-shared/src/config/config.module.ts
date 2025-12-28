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
          envFilePath: '.env',
          isGlobal: true,
          expandVariables: true,
        }),
      ],
      exports: [NestConfigModule],
    };
  }
}
