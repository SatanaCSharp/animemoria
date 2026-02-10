export { HealthGrpcController } from './controllers/health-grpc.controller';
export { HealthHttpController } from './controllers/health-http.controller';
export { HealthModule } from './health.module';
export { HealthProbeService } from './health-probe.service';
export { TypeOrmHealthcheckIndicator } from './indicators/typeorm.healthcheck-indicator';
export {
  type HealthcheckIndicatorType,
  type HealthIndicatorFunction,
  type HealthModuleOptions,
  type IHealthcheckIndicator,
} from './types/health-options';

// Re-export Terminus indicators so services can use them without adding @nestjs/terminus
export { TypeOrmHealthIndicator } from '@nestjs/terminus';
