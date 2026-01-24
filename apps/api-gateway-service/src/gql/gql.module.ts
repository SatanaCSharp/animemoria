import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLContext } from '@packages/nest-shared/graphql';
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
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const corsOrigins = isDevelopment
          ? '*'
          : process.env.CORS_ORIGINS?.split(',').map((origin) =>
              origin.trim(),
            ) || [];

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
            context: ({ req, res }: GraphQLContext): GraphQLContext => ({
              req,
              res,
            }),
            cors: {
              origin: corsOrigins,
              credentials: true,
            },
          },
        };
      },
    }),
  ],
})
export class GqlModule {}
