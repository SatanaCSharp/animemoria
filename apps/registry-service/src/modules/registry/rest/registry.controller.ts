import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { AppVariant, ServiceDescription } from '@packages/nest-shared/shared';
import { RegisterServiceCommandProcessor } from 'modules/registry/use-case/commands/register-service.command';
import { UnregisterServiceCommandProcessor } from 'modules/registry/use-case/commands/unregister-service.command';

@Controller('registry')
export class ServiceRegistryController {
  constructor(
    private readonly registerServiceCommandProcessor: RegisterServiceCommandProcessor,
    private readonly unregisterServiceCommandProcessor: UnregisterServiceCommandProcessor,
  ) {}

  @Post('/register')
  registerService(@Body() serviceDescription: ServiceDescription): void {
    this.registerServiceCommandProcessor.process({
      serviceDescription,
    });
  }

  @Delete('/unregister/:app-variant/:service_id')
  unregisterService(
    @Param('app-variant') appVariant: AppVariant,
    @Param('service_id') serviceId: string,
  ): void {
    this.unregisterServiceCommandProcessor.process({
      appVariant,
      serviceId,
    });
  }
}
