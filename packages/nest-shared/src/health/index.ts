export { HealthGrpcController } from './grpc/health.controller';
export {
  HealthGrpcModule,
  type HealthGrpcModuleAsyncOptions,
} from './grpc/health-grpc.module';
export { HealthModule, type HealthModuleAsyncOptions } from './health.module';
export { HealthProbeService } from './health-probe.service';
export { HealthController } from './http/health.controller';
export {
  HealthHttpModule,
  type HealthHttpModuleAsyncOptions,
} from './http/health-http.module';
export { TypeOrmHealthcheckIndicator } from './indicators/typeorm.healthcheck-indicator';
export {
  type HealthcheckIndicatorType,
  type HealthIndicatorFunction,
  type HealthModuleOptions,
  type IHealthcheckIndicator,
} from './types/health-options';

// Re-export Terminus indicators so services can use them without adding @nestjs/terminus
export { TypeOrmHealthIndicator } from '@nestjs/terminus';
