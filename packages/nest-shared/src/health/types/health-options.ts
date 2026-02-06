import type { HealthIndicatorResult } from '@nestjs/terminus';

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

/**
 * Core options: indicators only. Used by HealthModule (shared by HTTP and gRPC transports).
 */
export interface HealthModuleOptions {
  /** Health indicator functions to run for readiness. */
  healthcheckIndicators: HealthIndicatorFunction[];
}
