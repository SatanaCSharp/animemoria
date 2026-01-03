import * as Types from '__generated__/graphql-shared.type';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

export type GetUsersQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetUsersQuery = {
  getUsers: Array<{
    __typename: 'User';
    id: string;
    email: string;
    nickname: string;
  }>;
};

export const GetUsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetUsers' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getUsers' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'nickname' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
