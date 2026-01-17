import { Module } from '@nestjs/common';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppType } from '@packages/nest-shared/shared';
import { AppBaseModule } from 'app-base.module';
import { usersGrpcControllers } from 'users/grpc/controllers/controllers';

@Module({
  imports: [
    AppBaseModule,
    ClientRegistrationModule.forRoot({ appType: AppType.GRPC }),
  ],
  controllers: [...usersGrpcControllers],
})
export class GrpcModule {}
