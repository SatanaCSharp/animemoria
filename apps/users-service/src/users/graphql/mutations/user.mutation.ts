import { Args, Mutation, Resolver } from '@nestjs/graphql';
import * as userGql from '@packages/graphql-definitions/user';

@Resolver(() => userGql.User)
export class UserMutation extends userGql.UserMutationInterface {
  @Mutation(() => userGql.User)
  override createUser(
    @Args('input') input: userGql.CreateUserInput,
  ): Promise<userGql.User> {
    return Promise.resolve({
      id: '_create_uuid',
      email: input.email,
      nickname: input.nickname,
    });
  }
}
