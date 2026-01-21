import { Module } from '@nestjs/common';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppType } from '@packages/nest-shared/shared';
import { AppBaseModule } from 'app-base.module';
import { SessionGrpcModule } from 'session/session.grpc.module';

@Module({
  imports: [
    AppBaseModule,
    SessionGrpcModule,
    ClientRegistrationModule.forRoot({ appType: AppType.GRPC }),
  ],
})
export class GrpcModule {}
