import { DynamicModule, Module } from '@nestjs/common';
import { HealthGrpcController } from 'health/grpc/health.controller';
import { HealthModule } from 'health/health.module';
import { HealthcheckIndicatorType } from 'health/types/health-options';

export interface HealthGrpcModuleAsyncOptions {
  /**
   * Indicator classes (factories). Each is injected and getIndicator() is used.
   * Omit or pass [] for no indicators (e.g. gateway – process running only).
   */
  healthcheckIndicators?: HealthcheckIndicatorType[];
}

@Module({})
export class HealthGrpcModule {
  static forRootAsync(
    asyncOptions: HealthGrpcModuleAsyncOptions = {},
  ): DynamicModule {
    return {
      module: HealthGrpcModule,
      global: false,
      imports: [
        HealthModule.forRootAsync({
          healthcheckIndicators: asyncOptions.healthcheckIndicators ?? [],
        }),
      ],
      controllers: [HealthGrpcController],
      exports: [HealthModule],
    };
  }
}
