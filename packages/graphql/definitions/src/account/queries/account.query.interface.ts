import { Args, Query, Resolver } from '@nestjs/graphql';
import { NotImplementedError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { Account } from 'account/entities/account';

@Resolver(() => Account)
export class AccountQueryInterface {
  @Query(() => Account)
  me(@Args('id') id: string): Promise<Account> {
    assertFail(new NotImplementedError(undefined, id));
  }
}
