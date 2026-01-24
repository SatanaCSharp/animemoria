import { Controller } from '@nestjs/common';
import {
  CreateUserRequest,
  CreateUserResponse,
  UsersServiceController,
  UsersServiceControllerMethods,
} from '@packages/grpc';
import { CreateUserCommandProcessor } from 'users/use-case/commands/create-user.command';

@Controller()
@UsersServiceControllerMethods()
export class UsersController implements UsersServiceController {
  constructor(
    private readonly createUserCommandProcessor: CreateUserCommandProcessor,
  ) {}

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    return await this.createUserCommandProcessor.process(request);
  }
}
