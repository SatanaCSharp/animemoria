import { Injectable } from '@nestjs/common';
import { CommandProcessor } from '@packages/nest-shared/shared';
import { AccountStatus } from '@packages/shared-types/enums';
import { ApplicationError } from '@packages/shared-types/errors';
import { assert } from '@packages/utils/asserts';
import { isNull } from '@packages/utils/predicates';
import * as bcrypt from 'bcrypt';
import { UsersClientService } from 'shared/client-services/users.client-service';
import { AccountRepository } from 'shared/domain/repositories/account.repository';
import { SessionRepository } from 'shared/domain/repositories/session.repository';
import { AuthService, TokenPair } from 'shared/domain/services/auth.service';
import { AppType } from 'shared/types/app-type.enum';

const BCRYPT_SALT_ROUNDS = 10;

type Command = {
  nickname: string;
  email: string;
  password: string;
};

type Response = TokenPair;

@Injectable()
export class SignUpCommandProcessor implements CommandProcessor<
  Command,
  Response
> {
  constructor(
    private readonly authService: AuthService,
    private readonly accountRepository: AccountRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly usersClientService: UsersClientService,
  ) {}

  async process(command: Command): Promise<Response> {
    const { nickname, email, password } = command;

    // Check if email already exists
    const existingAccount = await this.accountRepository.findByEmail(email);
    assert(
      isNull(existingAccount),
      new ApplicationError('User already signed up'),
    );

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create account
    const account = await this.accountRepository.create({
      email,
      status: AccountStatus.ACTIVE,
      password: passwordHash,
    });

    // Create user via gRPC
    await this.usersClientService.createUser({
      email,
      nickname,
      accountId: account.id,
    });

    // Create session (Web only for sign up)
    const session = await this.sessionRepository.create({
      accountId: account.id,
      appType: AppType.WEB,
      refreshTokenHash: null,
    });

    // Generate tokens
    const tokens = await this.authService.getTokens(
      account.id,
      account.email,
      session.id,
    );

    // Hash and store refresh token

    await this.sessionRepository.update(session.id, {
      refreshTokenHash: tokens.refreshToken,
    });

    return tokens;
  }
}
