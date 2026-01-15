import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import * as accountGql from '@packages/graphql-definitions/account';
import { AccountGraphqlModule } from 'account/account.graphql.module';

@Module({
  imports: [
    AccountGraphqlModule,
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      buildSchemaOptions: {
        orphanedTypes: [accountGql.Account],
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
})
export class GqlModule {}
