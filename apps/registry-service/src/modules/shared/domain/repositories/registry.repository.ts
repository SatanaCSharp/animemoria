import { Injectable } from '@nestjs/common';
import {
  AppVariant,
  ServiceDescription,
  ServiceId,
} from '@packages/nest-shared/shared';
import { SystemError } from '@packages/shared-types/errors';
import type { Maybe } from '@packages/shared-types/shared';
import { assertDefined } from '@packages/utils/asserts';

const registry: Map<AppVariant, Map<ServiceId, ServiceDescription>> = new Map();

@Injectable()
export class RegistryRepository {
  addAppVariantRegistry(appVariant: AppVariant): void {
    if (registry.has(appVariant)) {
      return;
    }

    registry.set(appVariant, new Map<ServiceId, ServiceDescription>());
  }

  addServiceDescription(serviceDescription: ServiceDescription): void {
    const serviceDescriptionRegistry = this.getServiceDescriptionByAppVariant(
      serviceDescription.appVariant as AppVariant,
    );

    if (!serviceDescriptionRegistry.has(serviceDescription.serviceId)) {
      serviceDescriptionRegistry.set(
        serviceDescription.serviceId,
        serviceDescription,
      );
    }
  }

  removeServiceDescription(appVariant: AppVariant, serviceId: ServiceId): void {
    const serviceDescriptionRegistry =
      this.getServiceDescriptionByAppVariant(appVariant);
    serviceDescriptionRegistry.delete(serviceId);
  }

  getServiceDescriptions(appVariant: AppVariant): ServiceDescription[] {
    const serviceDescriptionRegistry =
      this.getServiceDescriptionByAppVariant(appVariant);

    return Array.from(serviceDescriptionRegistry.values());
  }

  getServiceDescription(
    appVariant: AppVariant,
    serviceId: ServiceId,
  ): ServiceDescription {
    const serviceDescriptionRegistry =
      this.getServiceDescriptionByAppVariant(appVariant);

    const serviceDescription = serviceDescriptionRegistry.get(appVariant);

    assertDefined(
      serviceDescription,
      new SystemError(
        `serviceDescription does not exist by serviceId: ${serviceId}`,
      ),
    );

    return serviceDescription;
  }

  getServiceDescriptionByServiceName(
    appVariant: AppVariant,
    serviceName: string,
  ): ServiceDescription {
    const serviceDescriptionRegistry =
      this.getServiceDescriptionByAppVariant(appVariant);
    let serviceDescription: Maybe<ServiceDescription> = null;

    for (const registryServiceDescription of serviceDescriptionRegistry.values()) {
      if (registryServiceDescription.serviceName === serviceName) {
        serviceDescription = registryServiceDescription;
      }
    }

    assertDefined(
      serviceDescription,
      new SystemError(
        `serviceDescription does not exist by serviceName: ${serviceName}`,
      ),
    );

    return serviceDescription;
  }

  getServiceDescriptionByAppVariant(
    appVariant: AppVariant,
  ): Map<ServiceId, ServiceDescription> {
    const serviceDescriptionRegistry = registry.get(appVariant);

    assertDefined(
      serviceDescriptionRegistry,
      new SystemError(
        `serviceDescriptionRegistry does not exist by appVariant: ${appVariant}`,
      ),
    );

    return serviceDescriptionRegistry;
  }
}
