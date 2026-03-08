import { Args, Mutation, Resolver } from '@nestjs/graphql';
import type { GraphQLContext } from '@packages/nest-shared/graphql';
import { NotImplementedError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { AccountResponse } from 'account/dto/account.response';
import { SignInInput } from 'account/dto/sign-in.input';
import { SignUpInput } from 'account/dto/sign-up.input';
import { Account } from 'account/entities/account';

@Resolver(() => Account)
export class AccountMutationInterface {
  @Mutation(() => AccountResponse)
  signUp(
    @Args('input') input: SignUpInput,
    context: GraphQLContext,
  ): Promise<AccountResponse> {
    assertFail(new NotImplementedError(undefined, input));
  }

  @Mutation(() => AccountResponse)
  signIn(
    @Args('input') input: SignInInput,
    context: GraphQLContext,
  ): Promise<AccountResponse> {
    assertFail(new NotImplementedError(undefined, input));
  }

  @Mutation(() => Account)
  blockAccount(@Args('id') id: string): Promise<Account> {
    assertFail(new NotImplementedError(undefined, id));
  }

  @Mutation(() => Account)
  unblockAccount(@Args('id') id: string): Promise<Account> {
    assertFail(new NotImplementedError(undefined, id));
  }
}
