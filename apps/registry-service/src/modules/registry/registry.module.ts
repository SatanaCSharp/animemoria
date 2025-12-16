import { Module } from '@nestjs/common';
import { ServiceRegistryController } from 'modules/registry/rest/registry.controller';
import { UseCaseModule } from 'modules/registry/use-case/use-case.module';

@Module({
  imports: [UseCaseModule],
  controllers: [ServiceRegistryController],
})
export class RegistryModule {}
