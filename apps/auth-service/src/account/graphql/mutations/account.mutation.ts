import { ConfigService } from '@nestjs/config';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import * as accountGql from '@packages/graphql-definitions/account';
import { setRefreshTokenCookie } from '@packages/nest-shared/auth';
import { GraphQLContext } from '@packages/nest-shared/graphql';
import { NotImplementedError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { isProd } from '@packages/utils/predicates';
import { SignInCommandProcessor } from 'account/use-case/commands/sign-in.command';
import { SignUpCommandProcessor } from 'account/use-case/commands/sign-up.command';
import { extractAppTypeFromRequest } from 'shared/utils/extract-app-type-from-headers';

@Resolver(() => accountGql.Account)
export class AccountMutation extends accountGql.AccountMutationInterface {
  constructor(
    private readonly config: ConfigService,
    private readonly signUpCommandProcessor: SignUpCommandProcessor,
    private readonly signInCommandProcessor: SignInCommandProcessor,
  ) {
    super();
  }

  private get cookiesMaxAge(): number {
    return Number(this.config.getOrThrow('COOKIES_MAX_AGE'));
  }

  private get isSecureCookie(): boolean {
    return isProd(this.config.getOrThrow<string>('NODE_ENV'));
  }

  @Mutation(() => accountGql.AccountResponse)
  override async signUp(
    @Args('input') input: accountGql.SignUpInput,
    @Context() context: GraphQLContext,
  ): Promise<accountGql.AccountResponse> {
    const { accessToken, refreshToken } =
      await this.signUpCommandProcessor.process(input);

    setRefreshTokenCookie(context.res, {
      refreshToken,
      maxAgeInMs: this.cookiesMaxAge,
      isSecureCookie: this.isSecureCookie,
    });

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

    setRefreshTokenCookie(context.res, {
      refreshToken,
      maxAgeInMs: this.cookiesMaxAge,
      isSecureCookie: this.isSecureCookie,
    });

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
