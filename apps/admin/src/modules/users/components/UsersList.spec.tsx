import { screen } from '@testing-library/react';

import { testIds } from '__tests__/mocks/test-ids/modules/users';
import { renderWithApolloMocks } from '__tests__/utils/apollo-test-utils';
import { UsersList } from 'modules/users/components/UsersList';
import { GetUsersDocument } from 'modules/users/gql/queries/get-users.graphql.generated';

import type { MockLink } from '@apollo/client/testing';

describe('UsersList', () => {
  it('shows loading state when query is loading', () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetUsersDocument },
        result: {
          data: {
            getUsers: [
              {
                __typename: 'User',
                id: '1',
                email: 'alice@example.com',
                nickname: 'Alice',
              },
            ],
          },
        },
        delay: 100,
      },
    ];

    renderWithApolloMocks(<UsersList />, mocks);

    expect(screen.getByTestId(testIds.LOADING)).toBeInTheDocument();
    expect(screen.getByTestId(testIds.LOADING)).toHaveTextContent(
      'Loading users...',
    );
  });

  it('shows error message when query fails', async () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetUsersDocument },
        error: new Error('Network error'),
      },
    ];

    renderWithApolloMocks(<UsersList />, mocks);

    expect(
      await screen.findByText('Error loading users: Network error'),
    ).toBeInTheDocument();
    expect(screen.getByTestId(testIds.ERROR)).toHaveTextContent(
      'Error loading users: Network error',
    );
  });

  it('renders list of users when data is loaded', async () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetUsersDocument },
        result: {
          data: {
            getUsers: [
              {
                __typename: 'User',
                id: '1',
                email: 'alice@example.com',
                nickname: 'Alice',
              },
              {
                __typename: 'User',
                id: '2',
                email: 'bob@example.com',
                nickname: 'Bob',
              },
            ],
          },
        },
      },
    ];

    renderWithApolloMocks(<UsersList />, mocks);

    expect(await screen.findByTestId(testIds.HEADING)).toBeInTheDocument();
    expect(screen.getByTestId(testIds.HEADING)).toHaveTextContent('Users List');
    expect(screen.getByTestId(testIds.LIST)).toBeInTheDocument();
    const userItems = screen.getAllByTestId(testIds.USER_ITEM);
    expect(userItems).toHaveLength(2);
    expect(userItems[0]).toHaveTextContent('Alice');
    expect(userItems[0]).toHaveTextContent('alice@example.com');
    expect(userItems[1]).toHaveTextContent('Bob');
    expect(userItems[1]).toHaveTextContent('bob@example.com');
  });

  it('renders empty list when getUsers is empty', async () => {
    const mocks: MockLink.MockedResponse[] = [
      {
        request: { query: GetUsersDocument },
        result: { data: { getUsers: [] } },
      },
    ];

    renderWithApolloMocks(<UsersList />, mocks);

    expect(await screen.findByTestId(testIds.HEADING)).toBeInTheDocument();
    const list = screen.getByTestId(testIds.LIST);
    expect(list.children).toHaveLength(0);
  });
});
