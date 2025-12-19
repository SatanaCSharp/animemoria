import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppVariant } from '@packages/nest-shared/shared';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppLoggerModule.forRoot(),

    ClientRegistrationModule.forRoot({
      appVariant: AppVariant.GQL,
      serviceName: 'users-service',
      host: 'http://localhost:4102',
    }),
    // GracefulShutdownModule,
  ],
})
export class AppModule {}
