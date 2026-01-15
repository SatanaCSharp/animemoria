import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, MaxLength, MinLength } from 'class-validator';

@InputType()
export class SignUpInput {
  @Field()
  @MinLength(1)
  nickname!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(8)
  @MaxLength(32)
  password!: string;
}
