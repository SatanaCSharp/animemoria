import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { SubgraphModule } from 'gql/subgraph.module';
import { GetSubgraphServicesQueryProcessor } from 'gql/use-case/queries/get-subgraph-services.query';

@Global()
@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [SubgraphModule],
      inject: [GetSubgraphServicesQueryProcessor],
      useFactory: async (
        getSubgraphServicesQueryProcessor: GetSubgraphServicesQueryProcessor,
      ) => {
        const subgraphs = await getSubgraphServicesQueryProcessor.process();
        return {
          path: '/graphql',

          gateway: {
            supergraphSdl: new IntrospectAndCompose({
              subgraphs,
            }),
          },
          server: {
            introspection: true,
            playground: false, // <--- Disable NestJS legacy playground logic
            plugins: [
              ApolloServerPluginLandingPageLocalDefault({ embed: true }),
            ],
            context: () => ({}),
          },
        };
      },
    }),
  ],
})
export class GqlModule {}
