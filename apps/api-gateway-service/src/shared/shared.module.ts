import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { GrpcClientModule } from '@packages/nest-shared/grpc';
import { clientServices } from 'shared/client-services/client-services';

@Global()
@Module({
  imports: [HttpModule, GrpcClientModule.register(['auth-service'])],
  providers: [...clientServices],
  exports: [...clientServices],
})
export class SharedModule {}
