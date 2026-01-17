import { Global, Module } from '@nestjs/common';
import { GrpcClientModule } from '@packages/nest-shared/grpc';
import { repositories } from 'shared/domain/repositories/repositories';
import { services } from 'shared/services/services';

@Global()
@Module({
  imports: [GrpcClientModule.register(['users-service'])],
  providers: [...repositories, ...services],
  exports: [...repositories, ...services],
})
export class SharedModule {}
