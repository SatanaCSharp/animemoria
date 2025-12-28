import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { User } from '@packages/graphql-definitions/user';
import { userMutations } from 'users/graphql/mutations/mutations';
import { userQueries } from 'users/graphql/queries/queries';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      buildSchemaOptions: {
        orphanedTypes: [User],
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
    }),
  ],
  providers: [...userQueries, ...userMutations],
})
export class GqlModule {}
