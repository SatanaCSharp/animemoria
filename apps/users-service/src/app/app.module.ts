import { Module } from '@nestjs/common';
import { AppLoggerModule } from '@packages/nest-shared/app-logger';
import { ConfigModule } from '@packages/nest-shared/config';
import { ClientRegistrationModule } from '@packages/nest-shared/registry-service';
import { AppVariant } from '@packages/nest-shared/shared';
import { AppController } from 'app/app.controller';
import { AppService } from 'app/app.service';

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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
