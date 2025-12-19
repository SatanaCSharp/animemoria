import { Module } from '@nestjs/common';
import { ServiceRegistryController } from 'registry/rest/registry.controller';
import { UseCaseModule } from 'registry/use-case/use-case.module';

@Module({
  imports: [UseCaseModule],
  controllers: [ServiceRegistryController],
})
export class RegistryModule {}
