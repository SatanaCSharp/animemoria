import { Module } from '@nestjs/common';
import * as userGql from '@packages/graphql-definitions/user';
import { ApolloGqlGraphQLModule } from '@packages/nest-shared/graphql';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppType } from '@packages/nest-shared/shared';
import { AppBaseModule } from 'app-base.module';
import { UsersGraphqlModule } from 'users/users.graphql.module';

@Module({
  imports: [
    AppBaseModule,
    UsersGraphqlModule,
    ApolloGqlGraphQLModule.forRoot({ orphanedTypes: [userGql.User] }),
    ClientRegistrationModule.forRoot({ appType: AppType.GQL }),
  ],
})
export class GraphqlModule {}
