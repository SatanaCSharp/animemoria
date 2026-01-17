import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { OrmDbModule } from '@packages/nest-shared/orm';
import { AppSharedModule } from 'shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppLoggerModule.forRoot(),
    OrmDbModule.forRoot(),
    AppSharedModule,
  ],
})
export class AppBaseModule {}
