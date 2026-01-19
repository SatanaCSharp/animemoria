import { Module } from '@nestjs/common';
import { commands } from 'users/use-case/commands/commands';

@Module({
  providers: [...commands],
  exports: [...commands],
})
export class UseCaseModule {}
