import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import * as accountGql from '@packages/graphql-definitions/account';
import { GraphQLContext } from '@packages/nest-shared/graphql';
import { NotImplementedError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { SignInCommandProcessor } from 'account/use-case/commands/sign-in.command';
import { SignUpCommandProcessor } from 'account/use-case/commands/sign-up.command';
import { extractAppTypeFromRequest } from 'shared/utils/extract-app-type-from-headers';
import { setRefreshTokenCookie } from 'shared/utils/set-refresh-token-cookie';

@Resolver(() => accountGql.Account)
export class AccountMutation extends accountGql.AccountMutationInterface {
  constructor(
    private readonly signUpCommandProcessor: SignUpCommandProcessor,
    private readonly signInCommandProcessor: SignInCommandProcessor,
  ) {
    super();
  }

  @Mutation(() => accountGql.AccountResponse)
  override async signUp(
    @Args('input') input: accountGql.SignUpInput,
    @Context() context: GraphQLContext,
  ): Promise<accountGql.AccountResponse> {
    const { accessToken, refreshToken } =
      await this.signUpCommandProcessor.process(input);

    setRefreshTokenCookie(context.res, refreshToken);

    return { accessToken };
  }

  @Mutation(() => accountGql.AccountResponse)
  override async signIn(
    @Args('input') input: accountGql.SignInInput,
    @Context() context: GraphQLContext,
  ): Promise<accountGql.AccountResponse> {
    const appType = extractAppTypeFromRequest(context.req);

    const { accessToken, refreshToken } =
      await this.signInCommandProcessor.process({
        ...input,
        appType,
      });

    setRefreshTokenCookie(context.res, refreshToken);

    return { accessToken };
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
