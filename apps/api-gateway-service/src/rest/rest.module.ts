import { Module } from '@nestjs/common';
import { restControllers } from 'rest/controllers/controllers';

@Module({
  controllers: [...restControllers],
})
export class RestModule {}
