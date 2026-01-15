import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { repositories } from 'shared/domain/repositories/repositories';
import { services } from 'shared/services/services';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'users_service',
          protoPath: join(
            __dirname,
            `node_modules/@packages/grpc/protobufs/users-service.proto`,
          ),
          // TODO get from service registry
          url: process.env.USERS_SERVICE_GRPC_URL || 'localhost:5001',
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
        },
      },
    ]),
  ],
  providers: [...repositories, ...services],
  exports: [...repositories, ...services],
})
export class AppSharedModule {}
