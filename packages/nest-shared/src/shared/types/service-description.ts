import { AppVariant } from 'shared/enums/app-variant';

export type ServiceId = string;

export interface ServiceInitializationOptions {
  appVariant: AppVariant;
  serviceName: string;
  host: string;
}

export interface ServiceDescription {
  serviceId: ServiceId;
  serviceName: string;
  host: string;
}
