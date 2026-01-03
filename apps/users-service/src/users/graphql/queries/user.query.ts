import { Query, Resolver } from '@nestjs/graphql';
import { User, UserQueryInterface } from '@packages/graphql-definitions/user';

@Resolver(() => User)
export class UserQuery extends UserQueryInterface {
  @Query(() => [User])
  override getUsers(): Promise<User[]> {
    return Promise.resolve([
      Object.assign(User, {
        id: 'mock_id_1',
        email: 'testemail@email.cns',
        nickname: 'ansss',
      }),
      Object.assign(User, {
        id: 'mock_id_2',
        email: 'testemail2@email.cns',
        nickname: 'ddbd',
      }),
    ]);
  }
}
