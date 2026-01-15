import { AppType } from 'shared/enums/app-type';

export type ServiceId = string;

export interface ServiceInitializationOptions {
  appType: AppType;
}

export interface ServiceDescription {
  serviceId: ServiceId;
  serviceName: string;
  host: string;
}
