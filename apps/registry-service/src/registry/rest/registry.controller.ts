import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Post,
} from '@nestjs/common';
import {
  AppType,
  ServiceDescription,
  ServiceId,
} from '@packages/nest-shared/shared';
import { RegisterServiceCommandProcessor } from 'registry/use-case/commands/register-service.command';
import { UnregisterServiceCommandProcessor } from 'registry/use-case/commands/unregister-service.command';
import { GetServiceDescriptionQueryProcessor } from 'registry/use-case/queries/get-service-description.query';
import { GetServiceDescriptionByNamesQueryProcessor } from 'registry/use-case/queries/get-service-description-by-names.query';
import { GetServiceDescriptionsByAppTypeQueryProcessor } from 'registry/use-case/queries/get-service-descriptions-by-app-type.query';

@Controller('registry')
export class ServiceRegistryController {
  constructor(
    private readonly registerServiceCommandProcessor: RegisterServiceCommandProcessor,
    private readonly unregisterServiceCommandProcessor: UnregisterServiceCommandProcessor,
    private readonly getServiceDescriptionQueryProcessor: GetServiceDescriptionQueryProcessor,
    private readonly getServiceDescriptionsByAppTypeQueryProcessor: GetServiceDescriptionsByAppTypeQueryProcessor,
    private readonly getServiceDescriptionByNamesQueryProcessor: GetServiceDescriptionByNamesQueryProcessor,
  ) {}

  @Get('/:app_type')
  getByAppType(@Param('app_type') appType: AppType): {
    serviceDescriptions: ServiceDescription[];
  } {
    const serviceDescriptions =
      this.getServiceDescriptionsByAppTypeQueryProcessor.process({
        appType,
      });

    return { serviceDescriptions };
  }

  @Get('/:app_type/service-descriptions/ids/:service_id')
  getByServiceId(
    @Param('app_type') appType: AppType,
    @Param('service_id') serviceId: ServiceId,
  ): { serviceDescription: ServiceDescription } {
    const serviceDescription = this.getServiceDescriptionQueryProcessor.process(
      {
        appType,
        serviceId,
      },
    );
    return { serviceDescription };
  }

  @Get('/:app_type/service-descriptions/service-names/:service_names')
  getByServiceNames(
    @Param('app_type') appType: AppType,
    @Param(
      'service_names',
      new ParseArrayPipe({ items: String, separator: ',' }),
    )
    serviceNames: string[],
  ): {
    serviceDescriptions: ServiceDescription[];
  } {
    const serviceDescriptions =
      this.getServiceDescriptionByNamesQueryProcessor.process({
        appType,
        serviceNames,
      });

    return { serviceDescriptions };
  }

  @Post('/:app_type/register')
  registerServiceDescription(
    @Param('app_type') appType: AppType,
    @Body() serviceDescription: ServiceDescription,
  ): void {
    this.registerServiceCommandProcessor.process({
      appType,
      serviceDescription,
    });
  }

  @Delete('/:app_type/unregister/:service_id')
  unregisterServiceDescription(
    @Param('app_type') appType: AppType,
    @Param('service_id') serviceId: string,
  ): void {
    this.unregisterServiceCommandProcessor.process({
      appType,
      serviceId,
    });
  }
}
