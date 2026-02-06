import type { Provider, Type } from '@nestjs/common';
import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SystemError } from '@packages/shared-types/errors';
import { assertFail } from '@packages/utils/asserts';
import { isDefined, isEmpty } from '@packages/utils/predicates';
import { HEALTH_INDICATORS } from 'health/constants';
import { HealthGrpcController } from 'health/controllers/health-grpc.controller';
import { HealthProbeService } from 'health/health-probe.service';
import type { IHealthcheckIndicator } from 'health/types/health-options';
import {
  HealthIndicatorFunction,
  HealthModuleOptions,
} from 'health/types/health-options';
import { AppType } from 'shared/enums/app-type';

/**
 * Unified health module that registers appropriate controller based on app type.
 *
 * - REST/GQL: Registers HTTP controller with /health, /health/live, /health/ready endpoints
 * - GRPC: Registers gRPC controller implementing grpc.health.v1.Health protocol
 *
 * @example
 * // For REST/GraphQL apps:
 * HealthModule.forRoot({
 *   appType: AppType.REST,
 *   healthcheckIndicators: [TypeOrmHealthcheckIndicator],
 * })
 *
 * @example
 * // For gRPC apps (requires getServerGrpcOption which includes health.proto):
 * HealthModule.forRoot({
 *   appType: AppType.GRPC,
 *   healthcheckIndicators: [TypeOrmHealthcheckIndicator],
 * })
 */
@Module({})
export class HealthModule {
  static forRoot(options: HealthModuleOptions): DynamicModule {
    const providers: Provider[] = [HealthProbeService];
    const controllers = this.getControllers(options.appType);

    const hasIndicators =
      isDefined(options.healthcheckIndicators) &&
      !isEmpty(options.healthcheckIndicators);

    if (hasIndicators) {
      const indicatorClasses = options.healthcheckIndicators!;

      providers.push(...indicatorClasses);
      providers.push({
        provide: HEALTH_INDICATORS,
        inject: indicatorClasses,
        useFactory: (
          ...instances: IHealthcheckIndicator[]
        ): HealthIndicatorFunction[] => instances.map((i) => i.getIndicator()),
      });
    } else {
      providers.push({
        provide: HEALTH_INDICATORS,
        useValue: [],
      });
    }

    return {
      module: HealthModule,
      global: false,
      imports: [TerminusModule],
      controllers,
      providers,
      exports: [HealthProbeService, TerminusModule],
    };
  }

  private static getControllers(appType: AppType): Type[] {
    switch (appType) {
      case AppType.GRPC:
        return [HealthGrpcController];
      case AppType.REST:
      case AppType.GQL:
      default:
        assertFail(new SystemError(`case ${appType} has not been registered`));
    }
  }
}
