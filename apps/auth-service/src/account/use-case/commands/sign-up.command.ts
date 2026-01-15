import { Injectable } from '@nestjs/common';
import { CommandProcessor } from '@packages/nest-shared/shared';

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
  process(command: Command): Promise<Response> {
    return Promise.resolve({
      accessToken: `${command.email} ${command.password}`,
    });
  }
}
