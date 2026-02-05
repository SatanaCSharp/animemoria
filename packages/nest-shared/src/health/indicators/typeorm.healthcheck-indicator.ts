import { Injectable } from '@nestjs/common';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import type { IHealthcheckIndicator } from 'health/types/health-options';

/**
 * Built-in health-check indicator that pings the default TypeORM database connection.
 * Use with HealthHttpModule.forRootAsync({ healthcheckIndicators: [TypeOrmHealthcheckIndicator] }).
 */
@Injectable()
export class TypeOrmHealthcheckIndicator implements IHealthcheckIndicator {
  constructor(private readonly typeOrm: TypeOrmHealthIndicator) {}

  getIndicator() {
    return () => this.typeOrm.pingCheck('database');
  }
}
