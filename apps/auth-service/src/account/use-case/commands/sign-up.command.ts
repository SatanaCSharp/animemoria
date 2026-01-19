import { Injectable } from '@nestjs/common';
import { CommandProcessor } from '@packages/nest-shared/shared';
import { AccountStatus } from '@packages/shared-types/enums';
import { ApplicationError } from '@packages/shared-types/errors';
import { assert } from '@packages/utils/asserts';
import { isNull } from '@packages/utils/predicates';
import * as bcrypt from 'bcrypt';
import { AccountRepository } from 'shared/domain/repositories/account.repository';
import { UsersService } from 'shared/services/users.service';

type Command = {
  nickname: string;
  email: string;
  password: string;
};
type Response = {
  accessToken: string;
};

@Injectable()
export class SignUpCommandProcessor implements CommandProcessor<
  Command,
  Response
> {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly usersService: UsersService,
  ) {}

  async process(command: Command): Promise<Response> {
    const { nickname, email, password } = command;
    // TODO replace from config, add config schema
    const saltRound = 10;
    const existingAccount = await this.accountRepository.findByEmail(email);

    assert(
      isNull(existingAccount),
      new ApplicationError('User already signed up'),
    );

    const passwordHash = await bcrypt.hash(password, saltRound);
    // TODO generate migration
    const account = await this.accountRepository.create({
      email,
      status: AccountStatus.ACTIVE,
      password: passwordHash,
    });

    const user = await this.usersService.createUser({ email, nickname });

    return Promise.resolve({
      accessToken: `${account.email} ${user.id}`,
    });
  }
}
