import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  CreateUserInput,
  User,
  UserMutationInterface,
} from '@packages/graphql-definitions/user';

@Resolver(() => User)
export class UserMutation extends UserMutationInterface {
  @Mutation(() => User)
  override blockUser(@Args('id') id: string): Promise<User> {
    return Promise.resolve({
      id,
      email: 'testemail@email.cns',
      nickname: 'ansss',
    });
  }

  @Mutation(() => User)
  override createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return Promise.resolve({
      id: '_create_uuid',
      email: input.email,
      nickname: input.nickname,
    });
  }
}
