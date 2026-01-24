import { Module } from '@nestjs/common';
import { grpcControllers } from 'session/grpc/controllers/controllers';
import { UseCaseModule } from 'session/use-case/use-case.module';

@Module({
  imports: [UseCaseModule],
  controllers: [...grpcControllers],
})
export class SessionGrpcModule {}
