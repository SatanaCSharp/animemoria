import { BeforeApplicationShutdown, Module } from '@nestjs/common';
import { AppLoggerModule } from 'app-logger';
import { ConfigModule } from 'config';
import { GracefulShutdownService } from 'graceful-shutdown/graceful-shutdown.service';

@Module({
  imports: [ConfigModule, AppLoggerModule],
  providers: [GracefulShutdownService],
  exports: [GracefulShutdownService],
})
export class GracefulShutdownModule implements BeforeApplicationShutdown {
  constructor(private shutdownService: GracefulShutdownService) {}

  async beforeApplicationShutdown(): Promise<void> {
    await this.shutdownService.shutdown();
  }
}
