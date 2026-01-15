import { Query, Resolver } from '@nestjs/graphql';
import * as userGql from '@packages/graphql-definitions/user';

@Resolver(() => userGql.User)
export class UserQuery extends userGql.UserQueryInterface {
  @Query(() => [userGql.User])
  override getUsers(): Promise<userGql.User[]> {
    return Promise.resolve([
      Object.assign(userGql.User, {
        id: 'mock_id_1',
        email: 'testemail@email.cns',
        nickname: 'ansss',
      }),
      Object.assign(userGql.User, {
        id: 'mock_id_2',
        email: 'testemail2@email.cns',
        nickname: 'ddbd',
      }),
    ]);
  }
}
