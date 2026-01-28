import { IntrospectAndCompose, RemoteGraphQLDataSource } from '@apollo/gateway';
import { GraphQLDataSourceProcessOptions } from '@apollo/gateway/src/datasources/types';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Global, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLContext } from '@packages/nest-shared/graphql';
import { Request } from 'express';
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
            supergraphSdl: new IntrospectAndCompose({ subgraphs }),
            // TODO refactor with UniversalGraphQLDataSource extends RemoteGraphQLDataSource
            //   it has to support different strategies, authorized, anonymous and admin user
            buildService({ url }) {
              return new RemoteGraphQLDataSource({
                url,
                willSendRequest({
                  request,
                  context,
                }: GraphQLDataSourceProcessOptions<GraphQLContext>) {
                  // Always set apollo-require-preflight header to bypass CSRF protection
                  request?.http?.headers.set(
                    'apollo-require-preflight',
                    'true',
                  );

                  const contextReq = context.req as Request;
                  // Forward the x-app-type header from the gateway to subgraphs
                  if (contextReq?.headers?.['x-app-type']) {
                    request?.http?.headers.set(
                      'x-app-type',
                      contextReq.headers['x-app-type'] as string,
                    );
                  }

                  // Forward other headers as needed (authorization, cookies, etc.)
                  if (contextReq?.headers?.['authorization']) {
                    request?.http?.headers.set(
                      'authorization',
                      contextReq.headers['authorization'],
                    );
                  }

                  if (contextReq?.headers?.['cookie']) {
                    request?.http?.headers.set(
                      'cookie',
                      contextReq.headers['cookie'],
                    );
                  }
                },
              });
            },
          },

          server: {
            introspection: true,
            playground: false, // <--- Disable NestJS legacy playground logic
            plugins: [
              ApolloServerPluginLandingPageLocalDefault({ embed: true }),
            ],

            // TODO build context with auth data, permissions, request headers, request, accountId, userId
            //   it has to support different strategies, authorized, anonymous and admin user
            //   Once account role-permissions will be implemented, add necessary context implementation
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
