import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { HealthHttpModule } from '@packages/nest-shared/health';
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
    HealthHttpModule.forRootAsync(),
  ],
})
export class RestModule {}
