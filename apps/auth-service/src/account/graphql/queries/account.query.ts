import { Args, Query, Resolver } from '@nestjs/graphql';
import * as accountGql from '@packages/graphql-definitions/account';
import { NotImplementedError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';

@Resolver(() => accountGql.Account)
export class AccountQuery extends accountGql.AccountQueryInterface {
  @Query(() => accountGql.Account)
  override me(@Args('id') id: string): Promise<accountGql.Account> {
    assertFail(new NotImplementedError(undefined, id));
  }
}
