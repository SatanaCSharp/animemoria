import { Global, Module } from '@nestjs/common';
import { repositories } from 'shared/domain/repositories/repositories';

@Global()
@Module({
  providers: [...repositories],
  exports: [...repositories],
})
export class AppSharedModule {}
