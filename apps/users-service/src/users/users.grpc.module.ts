import { Module } from '@nestjs/common';
import { grpcControllers } from 'users/grpc/controllers/controllers';
import { UseCaseModule } from 'users/use-case/use-case.module';

@Module({
  imports: [UseCaseModule],
  controllers: [...grpcControllers],
})
export class UsersGrpcModule {}
