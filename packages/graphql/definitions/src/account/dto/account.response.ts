import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AccountResponse {
  @Field()
  accessToken!: string;
}
