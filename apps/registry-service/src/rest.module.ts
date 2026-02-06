import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { HealthModule } from '@packages/nest-shared/health';
import { AppType } from '@packages/nest-shared/shared';
import { RegistryRestModule } from 'registry/registry.rest.module';
import { SharedModule } from 'shared/shared.module';

@Module({
  imports: [
    // Global modules - ConfigModule must be imported before AppLoggerModule
    // since AppLoggerModule depends on ConfigService
    ConfigModule.forRoot(),
    AppLoggerModule.forRoot(),
    // Application modules
    SharedModule,
    RegistryRestModule,
    HealthModule.forRoot({ appType: AppType.REST }),
  ],
})
export class RestModule {}
