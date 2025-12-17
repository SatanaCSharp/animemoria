import { Injectable } from '@nestjs/common';
import { sleep } from '@packages/utils/async';
import { PinoLogger } from 'nestjs-pino';

type GracefulShutdownCallback = () => Promise<void>;

@Injectable()
export class GracefulShutdownService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GracefulShutdownService.name);
  }

  private shutdownCallbacks: GracefulShutdownCallback[] = [];

  registerShutdownCallback(callback: GracefulShutdownCallback): void {
    this.shutdownCallbacks.push(callback);
  }

  async shutdown(): Promise<void> {
    this.logger.info(`Starting graceful shutdown...`);

    const shutdownPromises = this.shutdownCallbacks.map((cb) => cb());

    await Promise.allSettled(shutdownPromises);

    await sleep(1000);

    this.logger.info('Finished graceful shutdown successfully.');
  }
}
