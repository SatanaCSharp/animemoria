import { HttpModule } from '@nestjs/axios';
import {
  DynamicModule,
  Logger,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { SERVICE_INITIALIZATION_OPTIONS } from 'registry-service/injections.token';
import { ModuleInitializerService } from 'registry-service/module-initializer.service';
import { ServiceInitializationOptions } from 'shared/types/service-description';

@Module({})
export class ClientRegistrationModule
  implements
    OnModuleInit,
    OnModuleDestroy,
    OnApplicationShutdown,
    OnApplicationBootstrap
{
  constructor(
    private readonly moduleInitializerService: ModuleInitializerService,
  ) {}

  private readonly logger: Logger = new Logger(ClientRegistrationModule.name);

  static forRoot(options: ServiceInitializationOptions): DynamicModule {
    return {
      global: true,
      imports: [HttpModule],
      module: ClientRegistrationModule,
      providers: [
        ModuleInitializerService,
        {
          provide: SERVICE_INITIALIZATION_OPTIONS,
          useValue: options,
        },
      ],
      exports: [ModuleInitializerService],
    };
  }

  onModuleInit(): void {
    this.moduleInitializerService.setServiceId();
  }

  onApplicationBootstrap(): void {
    this.moduleInitializerService.register().catch((err) => {
      this.logger.error(err);
    });
  }

  onModuleDestroy(): void {
    this.moduleInitializerService.unregister().catch((err) => {
      this.logger.error(err);
    });
  }

  onApplicationShutdown(): void {
    this.moduleInitializerService.unregister().catch((err) => {
      this.logger.error(err);
    });
  }
}
