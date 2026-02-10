import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import type { HealthCheckResult } from '@nestjs/terminus';
import type { Response } from 'express';
import { HealthProbeService } from 'health/health-probe.service';

/**
 * Health controller for HTTP transport (REST/GraphQL). Exposes fixed routes.
 */
@Controller('health')
export class HealthHttpController {
  constructor(private readonly healthProbeService: HealthProbeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async health(@Res() res: Response): Promise<void> {
    const result = await this.healthProbeService.getHealth();
    this.sendResult(res, result);
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  liveness(@Res() res: Response): void {
    const result = this.healthProbeService.getLiveness();
    this.sendResult(res, result);
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async readiness(@Res() res: Response): Promise<void> {
    const result = await this.healthProbeService.getReadiness();
    this.sendResult(res, result);
  }

  private sendResult(res: Response, result: HealthCheckResult): void {
    const status =
      result.status === 'ok'
        ? HttpStatus.OK
        : result.status === 'shutting_down'
          ? HttpStatus.SERVICE_UNAVAILABLE
          : HttpStatus.SERVICE_UNAVAILABLE;
    res.status(status).json(result);
  }
}
