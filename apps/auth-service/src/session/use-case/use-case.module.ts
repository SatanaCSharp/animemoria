import { Module } from '@nestjs/common';
import { commands } from 'session/use-case/command/commands';

@Module({
  providers: [...commands],
  exports: [...commands],
})
export class UseCaseModule {}
