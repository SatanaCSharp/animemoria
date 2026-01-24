import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { DynamicModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Request, Response } from 'express';

type Args = {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  orphanedTypes?: (Function | object)[];
};

export type GraphQLContext = {
  req: Request;
  res: Response;
};

@Module({})
export class ApolloGqlGraphQLModule {
  static forRoot(args: Args): DynamicModule {
    return {
      module: ApolloGqlGraphQLModule,
      imports: [
        GraphQLModule.forRoot<ApolloFederationDriverConfig>({
          driver: ApolloFederationDriver,
          buildSchemaOptions: {
            orphanedTypes: args.orphanedTypes,
          },
          autoSchemaFile: {
            federation: 2,
          },

          playground: false, // Disable the old playground
          path: '/graphql', // Route path
          introspection: true, // Required for the Gateway to read this subgraph
          plugins: [
            ApolloServerPluginLandingPageLocalDefault({ embed: true }), // Enable Sandbox
          ],
          context: ({ req, res }: GraphQLContext): GraphQLContext => ({
            req,
            res,
          }),
        }),
      ],
    };
  }
}
