import { Injectable } from '@nestjs/common';
import { CommandProcessor } from '@packages/nest-shared/shared';
import { UserRepository } from 'shared/domain/repositories/user.repository';

type Command = {
  email: string;
  nickname: string;
  accountId: string;
};
type Response = {
  id: string;
  accountId: string;
  email: string;
  nickname: string;
};

@Injectable()
export class CreateUserCommandProcessor implements CommandProcessor<
  Command,
  Response
> {
  constructor(private readonly userRepository: UserRepository) {}

  async process(command: Command): Promise<Response> {
    const { id, nickname, email, accountId } =
      await this.userRepository.create(command);

    return { id, nickname, email, accountId };
  }
}
