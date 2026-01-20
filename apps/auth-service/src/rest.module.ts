import { Module } from '@nestjs/common';
import { AppBaseModule } from 'app-base.module';
import { SessionModule } from 'session/session.module';

@Module({
  imports: [AppBaseModule, SessionModule],
})
export class RestModule {}
