import { Module } from '@nestjs/common';
import { AuthModule } from '@packages/nest-shared/auth';
import { AppBaseModule } from 'app-base.module';

@Module({
  imports: [
    AppBaseModule,
    AuthModule.forRoot({ enableRefreshToken: true }),
    RestModule,
  ],
})
export class RestModule {}
