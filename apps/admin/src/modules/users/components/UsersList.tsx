import { useQuery } from '@apollo/client/react';
import { GetUsersDocument } from 'modules/users/gql/queries/get-users.graphql.generated';
import { ReactElement } from 'react';

export const UsersList = (): ReactElement => {
  const { data, loading, error } = useQuery(GetUsersDocument);

  if (loading) {
    return <div>Loading users...</div>;
  }
  if (error) {
    return <div>Error loading users: {error.message}</div>;
  }

  return (
    <div>
      <h2>Users List</h2>
      <ul>
        {data?.getUsers.map((user) => (
          <li key={user.id}>
            <strong>{user.nickname}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};
