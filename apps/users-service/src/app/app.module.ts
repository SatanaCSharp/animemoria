import { Module } from '@nestjs/common';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppVariant } from '@packages/nest-shared/shared';
import { AppController } from 'app/app.controller';
import { AppService } from 'app/app.service';

@Module({
  imports: [
    ClientRegistrationModule.forRoot({
      appVariant: AppVariant.GQL,
      serviceName: 'users-service',
      registryServer: 'http://localhost:4101',
      host: 'http://localhost:4102',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
