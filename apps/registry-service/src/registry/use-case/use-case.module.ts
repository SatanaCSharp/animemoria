import { Module } from '@nestjs/common';
import { commands } from 'registry/use-case/commands/commands';
import { queries } from 'registry/use-case/queries/queries';

@Module({
  providers: [...commands, ...queries],
  exports: [...commands, ...queries],
})
export class UseCaseModule {}
