import { DynamicModule, Module } from '@nestjs/common';
import { HealthModule } from 'health/health.module';
import { HealthController } from 'health/http/health.controller';
import { HealthcheckIndicatorType } from 'health/types/health-options';

export interface HealthHttpModuleAsyncOptions {
  /**
   * Indicator classes (factories). Each is injected and getIndicator() is used.
   * Omit or pass [] for no indicators (e.g. gateway – process running only).
   */
  healthcheckIndicators?: HealthcheckIndicatorType[];
}

@Module({})
export class HealthHttpModule {
  static forRootAsync(
    asyncOptions: HealthHttpModuleAsyncOptions = {},
  ): DynamicModule {
    return {
      module: HealthHttpModule,
      global: false,
      imports: [
        HealthModule.forRootAsync({
          healthcheckIndicators: asyncOptions.healthcheckIndicators ?? [],
        }),
      ],
      controllers: [HealthController],
      exports: [HealthModule],
    };
  }
}
