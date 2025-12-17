import { GetServiceDescriptionQueryProcessor } from 'modules/registry/use-case/queries/get-service-description.query';
import { GetServiceDescriptionByNameQueryProcessor } from 'modules/registry/use-case/queries/get-service-description-by-name.query';
import { GetServiceDescriptionsByVariantQueryProcessor } from 'modules/registry/use-case/queries/get-service-descriptions-by-variant.query';

export const queries = [
  GetServiceDescriptionsByVariantQueryProcessor,
  GetServiceDescriptionQueryProcessor,
  GetServiceDescriptionByNameQueryProcessor,
];
