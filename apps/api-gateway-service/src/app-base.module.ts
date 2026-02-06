import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { HealthHttpModule } from '@packages/nest-shared/health';
import { SharedModule } from 'shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppLoggerModule.forRoot(),
    HealthHttpModule.forRootAsync(),
    SharedModule,
  ],
})
export class AppBaseModule {}
