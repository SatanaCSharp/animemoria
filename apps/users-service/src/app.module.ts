import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { OrmDbModule } from '@packages/nest-shared/orm';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppType } from '@packages/nest-shared/shared';
import { GqlModule } from 'gql.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppLoggerModule.forRoot(),
    OrmDbModule.forRoot(),
    GqlModule,
    ClientRegistrationModule.forRoot({ appType: AppType.GQL }),
  ],
})
export class AppModule {}
