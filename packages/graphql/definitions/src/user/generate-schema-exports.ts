import { UserMutationInterface } from 'user/mutations/user.mutation.interface';
import { UserQueryInterface } from 'user/queries/user.query.interface';

export const userResolvers = [UserQueryInterface, UserMutationInterface];
