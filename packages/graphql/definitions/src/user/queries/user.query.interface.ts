import { Args, Query, Resolver } from '@nestjs/graphql';
import { NotImplementedError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { User } from 'user/entities/user';

@Resolver(() => User)
export class UserQueryInterface {
  @Query(() => User)
  getUsers(@Args('id') id: string): Promise<User> {
    assertFail(new NotImplementedError<string>(undefined, id));
  }
}
