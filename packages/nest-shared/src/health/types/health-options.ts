import type { HealthIndicatorResult } from '@nestjs/terminus';
import type { AppType } from 'shared/enums/app-type';

/**
 * A function that performs a single health check and returns its result.
 * Used by Terminus HealthCheckService.check() and by HealthProbeService.
 */
export type HealthIndicatorFunction = () => Promise<HealthIndicatorResult>;

/**
 * Implement this interface to create a health-check indicator as a class (factory).
 * The module will inject your class and use getIndicator() to obtain the check function.
 */
export interface IHealthcheckIndicator {
  getIndicator(): HealthIndicatorFunction;
}

/** Type for indicator classes (factories) that can be passed to healthcheckIndicators. */
export type HealthcheckIndicatorType = (new (
  ...args: any[]
) => IHealthcheckIndicator) & { name?: string };

export interface HealthModuleOptions {
  /**
   * Application type determines which health controller to register:
   * - REST/GQL: HTTP controller with /health, /health/live, /health/ready endpoints
   * - GRPC: gRPC controller implementing grpc.health.v1.Health protocol
   */
  appType: AppType;

  /**
   * Indicator classes (factories). Each is injected and getIndicator() is used.
   * Omit or pass [] for no indicators (e.g. gateway – process running only).
   */
  healthcheckIndicators?: HealthcheckIndicatorType[];
}
