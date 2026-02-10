import type { HealthIndicatorFunction } from 'health/types/health-options';

export const HEALTH_INDICATORS = Symbol('HEALTH_INDICATORS');
export type HealthIndicatorsToken = HealthIndicatorFunction[];
