import { Module } from '@nestjs/common';
import { commands } from 'account/use-case/commands/commands';

@Module({
  providers: [...commands],
  exports: [...commands],
})
export class UseCaseModule {}
