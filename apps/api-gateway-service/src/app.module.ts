import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { GqlModule } from 'gql/gql.module';

@Module({
  imports: [ConfigModule.forRoot(), AppLoggerModule.forRoot(), GqlModule],
})
export class AppModule {}
