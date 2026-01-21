import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { SharedModule } from 'shared/shared.module';

@Module({
  imports: [ConfigModule.forRoot(), AppLoggerModule.forRoot(), SharedModule],
})
export class AppBaseModule {}
