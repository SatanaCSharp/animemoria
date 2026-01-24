import { AccountMutationInterface } from 'account/mutations/account.mutation.interface';
import { AccountQueryInterface } from 'account/queries/account.query.interface';

export const accountResolvers = [
  AccountMutationInterface,
  AccountQueryInterface,
];
