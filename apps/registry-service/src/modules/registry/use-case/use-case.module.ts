import { Module } from '@nestjs/common';
import { commands } from 'modules/registry/use-case/commands/commands';
import { queries } from 'modules/registry/use-case/queries/queries';

@Module({
  providers: [...commands, ...queries],
  exports: [...commands, ...queries],
})
export class UseCaseModule {}
