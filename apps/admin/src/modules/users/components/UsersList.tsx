import { useQuery } from '@apollo/client/react';
import { ReactElement } from 'react';

import { testIds } from '__tests__/mocks/test-ids/modules/users';
import { GetUsersDocument } from 'modules/users/gql/queries/get-users.graphql.generated';

export const UsersList = (): ReactElement => {
  const { data, loading, error } = useQuery(GetUsersDocument);

  if (loading) {
    return (
      <div data-testid={testIds.ROOT}>
        <div data-testid={testIds.LOADING}>Loading users...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div data-testid={testIds.ROOT}>
        <div data-testid={testIds.ERROR}>
          Error loading users: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div data-testid={testIds.ROOT}>
      <h2 data-testid={testIds.HEADING}>Users List</h2>
      <ul data-testid={testIds.LIST}>
        {data?.getUsers.map((user) => (
          <li key={user.id} data-testid={testIds.USER_ITEM}>
            <strong>{user.nickname}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};
