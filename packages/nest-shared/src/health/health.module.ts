import type { Provider } from '@nestjs/common';
import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { isDefined, isEmpty } from '@packages/utils/predicates';
import { HEALTH_INDICATORS } from 'health/constants';
import { HealthProbeService } from 'health/health-probe.service';
import type { HealthIndicatorFunction } from 'health/types/health-options';
import type { HealthcheckIndicatorType } from 'health/types/health-options';
import type { IHealthcheckIndicator } from 'health/types/health-options';

export interface HealthModuleAsyncOptions {
  /** Indicator classes (factories). Each is injected and getIndicator() is used. */
  healthcheckIndicators?: HealthcheckIndicatorType[];
}

/**
 * Core health module: registers indicators and HealthProbeService.
 * Shared by HTTP (HealthHttpModule) and gRPC (HealthGrpcModule) transports.
 */
@Module({})
export class HealthModule {
  static forRootAsync(asyncOptions: HealthModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [HealthProbeService];
    if (
      isDefined(asyncOptions.healthcheckIndicators) &&
      !isEmpty(asyncOptions.healthcheckIndicators)
    ) {
      const indicatorClasses = asyncOptions.healthcheckIndicators;

      providers.push(...indicatorClasses);
      providers.push({
        provide: HEALTH_INDICATORS,
        inject: indicatorClasses,
        useFactory: (
          ...instances: IHealthcheckIndicator[]
        ): HealthIndicatorFunction[] => instances.map((i) => i.getIndicator()),
      });
    }

    return {
      module: HealthModule,
      global: false,
      imports: [TerminusModule],
      providers,
      exports: [HealthProbeService, TerminusModule],
    };
  }
}
