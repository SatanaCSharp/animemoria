import { Module } from '@nestjs/common';
import * as accountGql from '@packages/graphql-definitions/account';
import { AuthModule } from '@packages/nest-shared/auth';
import { ApolloGqlGraphQLModule } from '@packages/nest-shared/graphql';
import {
  HealthHttpModule,
  TypeOrmHealthcheckIndicator,
} from '@packages/nest-shared/health';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppType } from '@packages/nest-shared/shared';
import { AccountGraphqlModule } from 'account/account.graphql.module';
import { AppBaseModule } from 'app-base.module';

@Module({
  imports: [
    AppBaseModule,
    AuthModule.forRoot({ enableRefreshToken: true }),
    AccountGraphqlModule,
    ApolloGqlGraphQLModule.forRoot({ orphanedTypes: [accountGql.Account] }),
    ClientRegistrationModule.forRoot({ appType: AppType.GQL }),
    HealthHttpModule.forRootAsync({
      healthcheckIndicators: [TypeOrmHealthcheckIndicator],
    }),
  ],
})
export class GraphqlModule {}
