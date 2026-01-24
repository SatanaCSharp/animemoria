import { Module } from '@nestjs/common';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppType } from '@packages/nest-shared/shared';
import { AppBaseModule } from 'app-base.module';
import { UsersGrpcModule } from 'users/users.grpc.module';

@Module({
  imports: [
    AppBaseModule,
    UsersGrpcModule,
    ClientRegistrationModule.forRoot({ appType: AppType.GRPC }),
  ],
})
export class GrpcModule {}
