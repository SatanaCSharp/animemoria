import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field(() => ID)
  id!: string;

  @Field()
  @Directive('@shareable')
  email!: string;

  @Field()
  @Directive('@shareable')
  nickname!: string;
}
