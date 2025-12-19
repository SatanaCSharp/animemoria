import { NestFactory } from '@nestjs/core';
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { writeFileSync } from 'fs';
import { printSchema } from 'graphql';
import { join } from 'path';
import { userResolvers } from 'user/generate-schema-exports';

async function generate(): Promise<void> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const factory = app.get(GraphQLSchemaFactory);
  const schema = await factory.create([...userResolvers]);

  // Point to the 'graphql/generated' folder
  const outputPath = join(__dirname, '../../generated/schema.gql');

  writeFileSync(outputPath, printSchema(schema));

  await app.close();
}
generate().catch((err: unknown): unknown => err);
