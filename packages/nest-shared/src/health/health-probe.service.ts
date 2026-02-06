import { Inject, Injectable } from '@nestjs/common';
import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { HEALTH_INDICATORS } from 'health/constants';
import type { HealthIndicatorFunction } from 'health/types/health-options';

/**
 * Service that runs health probes and returns their results.
 * Use this when you need programmatic access to health status (e.g. GraphQL resolver, internal checks).
 * For HTTP probes, the HealthController exposes the same results via REST.
 */
@Injectable()
export class HealthProbeService {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    @Inject(HEALTH_INDICATORS)
    private readonly indicators: HealthIndicatorFunction[],
  ) {}

  /**
   * Runs all configured health indicators and returns the combined result.
   * Use for readiness: "can this instance accept traffic?"
   * When no indicators are configured (e.g. gateway), returns ok (process running).
   */
  async getReadiness(): Promise<HealthCheckResult> {
    if (this.indicators.length === 0) {
      return this.getLiveness();
    }
    return this.healthCheckService.check(this.indicators);
  }

  /**
   * Liveness probe: returns ok if the process is alive.
   * Does not run dependency checks (DB, etc.). For Kubernetes liveness.
   */
  getLiveness(): HealthCheckResult {
    return {
      status: 'ok',
      info: { process: { status: 'up' } },
      error: {},
      details: { process: { status: 'up' } },
    };
  }

  /**
   * Full health check (same as readiness). Convenience alias.
   */
  async getHealth(): Promise<HealthCheckResult> {
    return this.getReadiness();
  }
}
