import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from 'user';

@ObjectType()
@Directive('@key(fields: "id")')
export class Account {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field(() => User)
  user!: User;
}
