import { Module } from '@nestjs/common';
import {
  HealthGrpcModule,
  TypeOrmHealthcheckIndicator,
} from '@packages/nest-shared/health';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppType } from '@packages/nest-shared/shared';
import { AppBaseModule } from 'app-base.module';
import { UsersGrpcModule } from 'users/users.grpc.module';

@Module({
  imports: [
    AppBaseModule,
    UsersGrpcModule,
    HealthGrpcModule.forRootAsync({
      healthcheckIndicators: [TypeOrmHealthcheckIndicator],
    }),
    ClientRegistrationModule.forRoot({ appType: AppType.GRPC }),
  ],
})
export class GrpcModule {}
