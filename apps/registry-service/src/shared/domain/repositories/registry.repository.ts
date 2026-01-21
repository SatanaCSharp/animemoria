import { Injectable } from '@nestjs/common';
import {
  AppType,
  ServiceDescription,
  ServiceId,
} from '@packages/nest-shared/shared';
import { SystemError } from '@packages/shared-types/errors';
import { assertDefined } from '@packages/utils/asserts';

const registry: Map<AppType, Map<ServiceId, ServiceDescription>> = new Map([
  [AppType.GRPC, new Map([])],
  [AppType.GQL, new Map([])],
  [AppType.REST, new Map([])],
]);

@Injectable()
export class RegistryRepository {
  addAppTypeRegistry(appType: AppType): void {
    if (registry.has(appType)) {
      return;
    }

    registry.set(appType, new Map<ServiceId, ServiceDescription>());
  }

  addServiceDescription(
    appType: AppType,
    serviceDescription: ServiceDescription,
  ): void {
    const serviceDescriptionRegistry =
      this.getServiceDescriptionByAppType(appType);

    if (!serviceDescriptionRegistry.has(serviceDescription.serviceId)) {
      serviceDescriptionRegistry.set(
        serviceDescription.serviceId,
        serviceDescription,
      );
    }
  }

  removeServiceDescription(appType: AppType, serviceId: ServiceId): void {
    const serviceDescriptionRegistry =
      this.getServiceDescriptionByAppType(appType);
    serviceDescriptionRegistry.delete(serviceId);
  }

  getServiceDescriptions(appType: AppType): ServiceDescription[] {
    const serviceDescriptionRegistry =
      this.getServiceDescriptionByAppType(appType);

    return Array.from(serviceDescriptionRegistry.values());
  }

  getServiceDescription(
    appType: AppType,
    serviceId: ServiceId,
  ): ServiceDescription {
    const serviceDescriptionRegistry =
      this.getServiceDescriptionByAppType(appType);

    const serviceDescription = serviceDescriptionRegistry.get(serviceId);

    assertDefined(
      serviceDescription,
      new SystemError(
        `serviceDescription does not exist by serviceId: ${serviceId}`,
      ),
    );

    return serviceDescription;
  }

  getServiceDescriptionByServiceNames(
    appType: AppType,
    serviceNames: string[],
  ): ServiceDescription[] {
    const serviceDescriptionRegistry =
      this.getServiceDescriptionByAppType(appType);

    const serviceDescriptions: ServiceDescription[] = [];
    const serviceNameSet = new Set(serviceNames);

    for (const registryServiceDescription of serviceDescriptionRegistry.values()) {
      if (serviceNameSet.has(registryServiceDescription.serviceName)) {
        serviceDescriptions.push(registryServiceDescription);
      }
    }

    return serviceDescriptions;
  }

  getServiceDescriptionByAppType(
    appType: AppType,
  ): Map<ServiceId, ServiceDescription> {
    const serviceDescriptionRegistry = registry.get(appType);

    assertDefined(
      serviceDescriptionRegistry,
      new SystemError(
        `serviceDescriptionRegistry does not exist by appType: ${appType}`,
      ),
    );

    return serviceDescriptionRegistry;
  }
}
