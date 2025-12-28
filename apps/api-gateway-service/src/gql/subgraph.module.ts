import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GetSubgraphServicesQueryProcessor } from 'gql/use-case/queries/get-subgraph-services.query';

@Module({
  imports: [HttpModule],
  providers: [GetSubgraphServicesQueryProcessor],
  exports: [GetSubgraphServicesQueryProcessor],
})
export class SubgraphModule {}
