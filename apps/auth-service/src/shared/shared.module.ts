import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GrpcClientModule } from '@packages/nest-shared/grpc';
import { clientServices } from 'shared/client-services/client-services';
import { repositories } from 'shared/domain/repositories/repositories';
import { services } from 'shared/domain/services/services';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    GrpcClientModule.forRoot(['users-service']),
  ],
  providers: [...repositories, ...services, ...clientServices],
  exports: [...repositories, ...services, ...clientServices],
})
export class SharedModule {}
