import { AppVariant } from 'shared/enums/app-variant';

export type ServiceId = string;

export interface ServiceInitializationOptions {
  appVariant: AppVariant;
  serviceName: string;
  registryServer: string;
  host: string;
}

export interface ServiceDescription {
  appVariant: AppVariant;
  serviceName: string;
  serviceId: ServiceId;
  host: string;
}
