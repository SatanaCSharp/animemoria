import { Controller } from '@nestjs/common';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  HealthCheckResponse_ServingStatus,
  HealthController as IHealthController,
  HealthControllerMethods,
} from '@packages/grpc';
import { HealthProbeService } from 'health/health-probe.service';
import { from, interval, Observable, startWith, switchMap } from 'rxjs';

/**
 * gRPC Health controller implementing the standard grpc.health.v1.Health service.
 * @see https://github.com/grpc/grpc/blob/master/doc/health-checking.md
 */
@Controller()
@HealthControllerMethods()
export class HealthGrpcController implements IHealthController {
  constructor(private readonly healthProbeService: HealthProbeService) {}

  /**
   * Synchronous health check. Returns current serving status.
   * Empty service name ("") checks overall server health (readiness).
   * Specific service names are not yet supported (returns SERVICE_UNKNOWN).
   */
  async check(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _request: HealthCheckRequest,
  ): Promise<HealthCheckResponse> {
    return this.getHealthStatus();
  }

  /**
   * Streaming health check. Emits status on initial connect and on changes.
   * Uses a polling interval (5s) to detect health changes.
   */
  watch(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _request: HealthCheckRequest,
  ): Observable<HealthCheckResponse> {
    const HEALTH_CHECK_INTERVAL_MS = 5000;

    return interval(HEALTH_CHECK_INTERVAL_MS).pipe(
      startWith(0),
      switchMap(() => from(this.getHealthStatus())),
    );
  }

  private async getHealthStatus(): Promise<HealthCheckResponse> {
    try {
      const result = await this.healthProbeService.getReadiness();
      const status =
        result.status === 'ok'
          ? HealthCheckResponse_ServingStatus.SERVING
          : HealthCheckResponse_ServingStatus.NOT_SERVING;

      return { status };
    } catch {
      return { status: HealthCheckResponse_ServingStatus.NOT_SERVING };
    }
  }
}
