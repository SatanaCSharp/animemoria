import { Injectable } from '@nestjs/common';
import { CommandProcessor } from '@packages/nest-shared/shared';
import { AccountStatus } from '@packages/shared-types/enums';
import { ApplicationError } from '@packages/shared-types/errors';
import { assert, assertDefined } from '@packages/utils/asserts';
import * as bcrypt from 'bcrypt';
import { AccountRepository } from 'shared/domain/repositories/account.repository';
import { SessionRepository } from 'shared/domain/repositories/session.repository';
import { AuthService, TokenPair } from 'shared/domain/services/auth.service';
import { AppType } from 'shared/types/app-type.enum';

const BCRYPT_SALT_ROUNDS = 10;

type Command = {
  email: string;
  password: string;
  appType: AppType;
};

type Response = TokenPair;

@Injectable()
export class SignInCommandProcessor implements CommandProcessor<
  Command,
  Response
> {
  constructor(
    private readonly authService: AuthService,
    private readonly accountRepository: AccountRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async process(command: Command): Promise<Response> {
    const { email, password, appType } = command;

    // Find account
    const account = await this.accountRepository.findByEmail(email);
    assertDefined(account, new ApplicationError('Invalid credentials'));

    // Verify account is active
    assert(
      account.status === AccountStatus.ACTIVE,
      new ApplicationError('Account is not active'),
    );

    // Verify password
    const passwordValid = await bcrypt.compare(password, account.password);
    assert(passwordValid, new ApplicationError('Invalid credentials'));

    // Create new session
    const session = await this.sessionRepository.create({
      accountId: account.id,
      appType,
      refreshTokenHash: null,
    });

    // Generate tokens
    const tokens = await this.authService.getTokens(
      account.id,
      account.email,
      session.id,
    );

    // Hash and store refresh token
    const refreshTokenHash = await bcrypt.hash(
      tokens.refreshToken,
      BCRYPT_SALT_ROUNDS,
    );
    await this.sessionRepository.update(session.id, { refreshTokenHash });

    return tokens;
  }
}
