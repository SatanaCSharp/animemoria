import { Module } from '@nestjs/common';
import { graphqlMutations } from 'users/graphql/mutations/mutations';
import { graphqlQueries } from 'users/graphql/queries/queries';

@Module({
  providers: [...graphqlQueries, ...graphqlMutations],
  exports: [...graphqlQueries, ...graphqlMutations],
})
export class UsersGraphqlModule {}
