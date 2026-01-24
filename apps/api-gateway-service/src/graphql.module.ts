import { Module } from '@nestjs/common';
import { AppBaseModule } from 'app-base.module';
import { GqlModule } from 'gql/gql.module';

@Module({
  imports: [AppBaseModule, GqlModule],
})
export class GraphqlModule {}
