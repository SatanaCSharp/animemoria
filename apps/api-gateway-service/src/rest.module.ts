import { Module } from '@nestjs/common';
import { AuthModule } from '@packages/nest-shared/auth';
import { AppBaseModule } from 'app-base.module';
import { RestEndpointsModule } from 'rest/rest-endpoints.module';

@Module({
  imports: [
    AppBaseModule,
    AuthModule.forRoot({ enableRefreshToken: true }),
    RestEndpointsModule,
  ],
})
export class RestModule {}
