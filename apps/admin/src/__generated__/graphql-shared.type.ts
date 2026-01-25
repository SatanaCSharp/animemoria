export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type Account = {
  __typename: 'Account';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  user: User;
};

export type AccountResponse = {
  __typename: 'AccountResponse';
  accessToken: Scalars['String']['output'];
};

export type CreateUserInput = {
  email: Scalars['String']['input'];
  nickname: Scalars['String']['input'];
};

export type Mutation = {
  __typename: 'Mutation';
  blockAccount: Account;
  createUser: User;
  signIn: AccountResponse;
  signUp: AccountResponse;
  unblockAccount: Account;
};

export type MutationBlockAccountArgs = {
  id: Scalars['String']['input'];
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationSignInArgs = {
  input: SignInInput;
};

export type MutationSignUpArgs = {
  input: SignUpInput;
};

export type MutationUnblockAccountArgs = {
  id: Scalars['String']['input'];
};

export type Query = {
  __typename: 'Query';
  getUsers: Array<User>;
  me: Account;
};

export type QueryMeArgs = {
  id: Scalars['String']['input'];
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignUpInput = {
  email: Scalars['String']['input'];
  nickname: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type User = {
  __typename: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  nickname: Scalars['String']['output'];
};
