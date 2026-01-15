import { Module } from '@nestjs/common';
import { accountMutations } from 'account/graphql/mutations/mutations';
import { accountQueries } from 'account/graphql/queries/queries';
import { UseCaseModule } from 'account/use-case/use-case.module';

@Module({
  imports: [UseCaseModule],
  providers: [...accountMutations, ...accountQueries],
  exports: [...accountMutations, ...accountQueries],
})
export class AccountGraphqlModule {}
