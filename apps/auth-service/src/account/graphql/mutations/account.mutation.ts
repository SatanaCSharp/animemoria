import { Args, Mutation, Resolver } from '@nestjs/graphql';
import * as accountGql from '@packages/graphql-definitions/account';
import { NotImplementedError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { SignUpCommandProcessor } from 'account/use-case/commands/sign-up.command';

@Resolver(() => accountGql.Account)
export class AccountMutation extends accountGql.AccountMutationInterface {
  constructor(private readonly signUpCommandProcessor: SignUpCommandProcessor) {
    super();
  }

  @Mutation(() => accountGql.AccountResponse)
  override async signUp(
    @Args('input') input: accountGql.SignUpInput,
  ): Promise<accountGql.AccountResponse> {
    const response = await this.signUpCommandProcessor.process(input);

    return Object.assign(accountGql.AccountResponse, response);
  }

  @Mutation(() => accountGql.AccountResponse)
  override signIn(
    @Args('input') input: accountGql.SignInInput,
  ): Promise<accountGql.AccountResponse> {
    return Promise.resolve(
      Object.assign(accountGql.AccountResponse, {
        accessToken: `${input.email}`,
      }),
    );
  }

  @Mutation(() => accountGql.Account)
  override blockAccount(@Args('id') id: string): Promise<accountGql.Account> {
    assertFail(new NotImplementedError(undefined, id));
  }

  @Mutation(() => accountGql.Account)
  override unblockAccount(@Args('id') id: string): Promise<accountGql.Account> {
    assertFail(new NotImplementedError(undefined, id));
  }
}
