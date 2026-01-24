import { GetServiceDescriptionQueryProcessor } from 'registry/use-case/queries/get-service-description.query';
import { GetServiceDescriptionByNamesQueryProcessor } from 'registry/use-case/queries/get-service-description-by-names.query';
import { GetServiceDescriptionsByAppTypeQueryProcessor } from 'registry/use-case/queries/get-service-descriptions-by-app-type.query';

export const queries = [
  GetServiceDescriptionByNamesQueryProcessor,
  GetServiceDescriptionsByAppTypeQueryProcessor,
  GetServiceDescriptionQueryProcessor,
];
