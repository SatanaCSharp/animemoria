import { DynamicModule, Module } from '@nestjs/common';
import { HealthModule } from 'health/health.module';

/**
 * gRPC transport for health checks. Use in gRPC microservice apps to expose health via gRPC health protocol.
 *
 * This module is a stub: it registers the core HealthModule so you can inject HealthProbeService.
 * Full gRPC health server implementation (e.g. grpc.health.v1.Health) can be added here later.
 *
 * @example
 * // Future usage when gRPC health is implemented:
 * HealthGrpcModule.forRootAsync({
 *   inject: [TypeOrmHealthIndicator],
 *   useFactory: (db) => ({
 *     indicators: [() => db.pingCheck('database')],
 *   }),
 * })
 */
@Module({})
export class HealthGrpcModule {
  static forRootAsync(): DynamicModule {
    return {
      module: HealthGrpcModule,
      global: false,
      imports: [HealthModule.forRootAsync({ healthcheckIndicators: [] })],
      exports: [HealthModule],
    };
  }
}
