import { Module } from '@nestjs/common';
import { graphqlMutations } from 'account/graphql/mutations/mutations';
import { graphqlQueries } from 'account/graphql/queries/queries';
import { UseCaseModule } from 'account/use-case/use-case.module';

@Module({
  imports: [UseCaseModule],
  providers: [...graphqlMutations, ...graphqlQueries],
  exports: [...graphqlMutations, ...graphqlQueries],
})
export class AccountGraphqlModule {}
