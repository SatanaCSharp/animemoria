import { Module } from '@nestjs/common';
import * as userGql from '@packages/graphql-definitions/user';
import { ApolloGqlGraphQLModule } from '@packages/nest-shared/graphql';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppType } from '@packages/nest-shared/shared';
import { AppBaseModule } from 'app-base.module';
import { userMutations } from 'users/graphql/mutations/mutations';
import { userQueries } from 'users/graphql/queries/queries';

@Module({
  imports: [
    AppBaseModule,
    ApolloGqlGraphQLModule.forRoot({ orphanedTypes: [userGql.User] }),
    ClientRegistrationModule.forRoot({ appType: AppType.GQL }),
  ],
  providers: [...userQueries, ...userMutations],
})
export class GraphqlModule {}
