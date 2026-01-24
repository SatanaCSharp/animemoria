import { HttpModule } from '@nestjs/axios';
import {
  DynamicModule,
  Module,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'app-logger';
import { ConfigModule } from 'config';
import {
  GracefulShutdownModule,
  GracefulShutdownService,
} from 'graceful-shutdown';
import { SERVICE_INITIALIZATION_OPTIONS } from 'registry-service/injections.token';
import { ModuleInitializerClientService } from 'registry-service/module-initializer.client-service';
import { ServiceInitializationOptions } from 'shared/types/service-description';

@Module({})
export class ClientRegistrationModule
  implements OnModuleInit, OnApplicationBootstrap
{
  constructor(
    private readonly moduleInitializerClientService: ModuleInitializerClientService,
    private readonly gracefulShutdownService: GracefulShutdownService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ClientRegistrationModule.name);
  }

  static forRoot(options: ServiceInitializationOptions): DynamicModule {
    return {
      global: true,
      imports: [HttpModule, ConfigModule, GracefulShutdownModule],
      module: ClientRegistrationModule,
      providers: [
        ModuleInitializerClientService,
        ConfigService,
        {
          provide: SERVICE_INITIALIZATION_OPTIONS,
          useValue: options,
        },
      ],
      exports: [ModuleInitializerClientService],
    };
  }

  onModuleInit(): void {
    this.moduleInitializerClientService.setServiceId();
    this.moduleInitializerClientService.register().catch((err) => {
      this.logger.error('Failed to register service', err);
    });
  }

  onApplicationBootstrap(): void {
    this.gracefulShutdownService.registerShutdownCallback(() =>
      this.moduleInitializerClientService.unregister(),
    );
  }
}
