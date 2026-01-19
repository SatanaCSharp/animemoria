import { Module } from '@nestjs/common';
import { AppBaseModule } from 'app-base.module';

@Module({
  imports: [AppBaseModule],
})
export class RestModule {}
