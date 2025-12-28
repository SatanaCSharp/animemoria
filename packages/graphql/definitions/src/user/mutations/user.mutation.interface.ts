import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { NotImplementedError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { User } from 'user/entities/user';
import { CreateUserInput } from 'user/inputs/create-user.input';

@Resolver(() => User)
export class UserMutationInterface {
  @Mutation(() => User)
  blockUser(@Args('id') id: string): Promise<User> {
    assertFail(new NotImplementedError(undefined, id));
  }

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput): Promise<User> {
    assertFail(new NotImplementedError(undefined, input));
  }
}
