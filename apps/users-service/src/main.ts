import { NestFactory } from '@nestjs/core';
import { AppModule } from 'app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line no-console
bootstrap().catch((err) => console.error(err));
