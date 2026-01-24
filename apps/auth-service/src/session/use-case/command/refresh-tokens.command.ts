import { Injectable } from '@nestjs/common';
import { CommandProcessor } from '@packages/nest-shared/shared';
import { AccountStatus } from '@packages/shared-types/enums';
import { ApplicationError } from '@packages/shared-types/errors';
import { assert, assertDefined } from '@packages/utils/asserts';
import { AccountRepository } from 'shared/domain/repositories/account.repository';
import { SessionRepository } from 'shared/domain/repositories/session.repository';
import { AuthService, TokenPair } from 'shared/domain/services/auth.service';

type Command = {
  accountId: string;
  sessionId: string;
  oldRefreshToken: string;
};

type Response = TokenPair;
@Injectable()
export class RefreshTokensCommandProcessor implements CommandProcessor<
  Command,
  Response
> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly authService: AuthService,
  ) {}

  async process(command: Command): Promise<TokenPair> {
    const { accountId, oldRefreshToken, sessionId } = command;

    // Find session
    const session = await this.sessionRepository.findById(sessionId);
    assertDefined(session, new ApplicationError('Session not found'));
    // Verify session belongs to account
    assert(
      session.accountId === accountId,
      new ApplicationError('Invalid session'),
    );

    // Verify refresh token hash exists
    assertDefined(
      session.refreshTokenHash,
      new ApplicationError('Invalid refresh token'),
    );

    // Verify old refresh token matches stored hash
    assert(
      oldRefreshToken === session.refreshTokenHash,
      new ApplicationError('Invalid refresh token'),
    );

    // Get account for email
    const account = await this.accountRepository.findById(accountId);
    assertDefined(account, new ApplicationError('Account not found'));

    // Verify account is still active
    assert(
      account.status === AccountStatus.ACTIVE,
      new ApplicationError('Account is not active'),
    );

    // Generate new tokens
    const tokens = await this.authService.getTokens(
      account.id,
      account.email,
      session.id,
    );

    await this.sessionRepository.update(session.id, {
      refreshTokenHash: tokens.refreshToken,
    });

    return tokens;
  }
}
