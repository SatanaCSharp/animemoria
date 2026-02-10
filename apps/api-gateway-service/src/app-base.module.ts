import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { HealthModule } from '@packages/nest-shared/health';
import { AppType } from '@packages/nest-shared/shared';
import { SharedModule } from 'shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppLoggerModule.forRoot(),
    HealthModule.forRoot({ appType: AppType.REST }),
    SharedModule,
  ],
})
export class AppBaseModule {}
