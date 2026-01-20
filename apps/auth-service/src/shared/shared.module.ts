import { Global, Module } from '@nestjs/common';
import { GrpcClientModule } from '@packages/nest-shared/grpc';
import { clientServices } from 'shared/client-services/client-services';
import { repositories } from 'shared/domain/repositories/repositories';
import { services } from 'shared/domain/services/services';

@Global()
@Module({
  imports: [GrpcClientModule.register(['users-service'])],
  providers: [...repositories, ...services, ...clientServices],
  exports: [...repositories, ...services, ...clientServices],
})
export class SharedModule {}
