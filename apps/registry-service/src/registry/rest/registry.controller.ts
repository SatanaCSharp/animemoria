import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  AppVariant,
  ServiceDescription,
  ServiceId,
} from '@packages/nest-shared/shared';
import { RegisterServiceCommandProcessor } from 'registry/use-case/commands/register-service.command';
import { UnregisterServiceCommandProcessor } from 'registry/use-case/commands/unregister-service.command';
import { GetServiceDescriptionQueryProcessor } from 'registry/use-case/queries/get-service-description.query';
import { GetServiceDescriptionByNameQueryProcessor } from 'registry/use-case/queries/get-service-description-by-name.query';
import { GetServiceDescriptionsByVariantQueryProcessor } from 'registry/use-case/queries/get-service-descriptions-by-variant.query';

@Controller('registry')
export class ServiceRegistryController {
  constructor(
    private readonly registerServiceCommandProcessor: RegisterServiceCommandProcessor,
    private readonly unregisterServiceCommandProcessor: UnregisterServiceCommandProcessor,
    private readonly getServiceDescriptionQueryProcessor: GetServiceDescriptionQueryProcessor,
    private readonly getServiceDescriptionByNameQueryProcessor: GetServiceDescriptionByNameQueryProcessor,
    private readonly getServiceDescriptionsByVariantQueryProcessor: GetServiceDescriptionsByVariantQueryProcessor,
  ) {}

  @Get('/:app_variant')
  getByAppVariant(@Param('app_variant') appVariant: AppVariant): {
    serviceDescriptions: ServiceDescription[];
  } {
    const serviceDescriptions =
      this.getServiceDescriptionsByVariantQueryProcessor.process({
        appVariant,
      });

    return { serviceDescriptions };
  }

  @Get('/:app_variant/service-descriptions/ids/:service_id')
  getByServiceId(
    @Param('app_variant') appVariant: AppVariant,
    @Param('service_id') serviceId: ServiceId,
  ): { serviceDescription: ServiceDescription } {
    const serviceDescription = this.getServiceDescriptionQueryProcessor.process(
      {
        appVariant,
        serviceId,
      },
    );
    return { serviceDescription };
  }

  @Get('/:app_variant/service-descriptions/service-names/:service_name')
  getByServiceName(
    @Param('app_variant') appVariant: AppVariant,
    @Param('service_name') serviceName: string,
  ): { serviceDescription: ServiceDescription } {
    const serviceDescription =
      this.getServiceDescriptionByNameQueryProcessor.process({
        appVariant,
        serviceName,
      });

    return { serviceDescription };
  }

  @Post('/:app_variant/register')
  registerServiceDescription(
    @Param('app_variant') appVariant: AppVariant,
    @Body() serviceDescription: ServiceDescription,
  ): void {
    this.registerServiceCommandProcessor.process({
      appVariant,
      serviceDescription,
    });
  }

  @Delete('/:app_variant/unregister/:service_id')
  unregisterServiceDescription(
    @Param('app_variant') appVariant: AppVariant,
    @Param('service_id') serviceId: string,
  ): void {
    this.unregisterServiceCommandProcessor.process({
      appVariant,
      serviceId,
    });
  }
}
