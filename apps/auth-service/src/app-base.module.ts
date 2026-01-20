import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { AuthModule } from '@packages/nest-shared/auth';
import { ConfigModule } from '@packages/nest-shared/config';
import { OrmDbModule } from '@packages/nest-shared/orm';
import { SharedModule } from 'shared/shared.module';

const AT_SECRET = 'access-token-secret-key-change-in-production';
const RT_SECRET = 'refresh-token-secret-key-change-in-production';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppLoggerModule.forRoot(),
    OrmDbModule.forRoot(),
    AuthModule.forRoot({
      atSecret: AT_SECRET,
      rtSecret: RT_SECRET,
      enableRefreshToken: true,
    }),
    SharedModule,
  ],
})
export class AppBaseModule {}
