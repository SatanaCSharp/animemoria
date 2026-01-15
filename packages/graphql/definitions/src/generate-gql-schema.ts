import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { accountResolvers } from 'account/generated-schema-exports';
import { writeFileSync } from 'fs';
import { printSchema } from 'graphql';
import { join } from 'path';
import { userResolvers } from 'user/generate-schema-exports';

const collectResolvers = (...args: Function[][]): Function[] => {
  return args.reduce(
    (acc: Function[], resolvers: Function[]) => [...acc, ...resolvers],
    [],
  );
};

async function generate(): Promise<void> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const factory = app.get(GraphQLSchemaFactory);

  const resolvers = collectResolvers(userResolvers, accountResolvers);

  const schema = await factory.create(resolvers);

  // Point to the 'graphql/generated' folder
  const outputPath = join(__dirname, '../../generated/schema.gql');

  writeFileSync(outputPath, printSchema(schema));

  await app.close();
}
generate().catch((err: unknown): unknown => err);
