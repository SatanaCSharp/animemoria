import { Args, Query, Resolver } from '@nestjs/graphql';
import { User, UserQueryInterface } from '@packages/graphql-definitions/user';

@Resolver(() => User)
export class UserQuery extends UserQueryInterface {
  @Query(() => User)
  override getUsers(@Args('id') id: string): Promise<User> {
    return Promise.resolve({
      id,
      email: 'testemail@email.cns',
      nickname: 'ansss',
    });
  }
}
