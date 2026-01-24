import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { NotImplementedError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { CreateUserInput } from 'user/dto/create-user.input';
import { User } from 'user/entities/user';

@Resolver(() => User)
export class UserMutationInterface {
  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput): Promise<User> {
    assertFail(new NotImplementedError(undefined, input));
  }
}
