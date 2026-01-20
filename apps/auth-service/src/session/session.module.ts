import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { restControllers } from 'session/rest/controller/controllers';
import { UseCaseModule } from 'session/use-case/use-case.module';

@Module({
  imports: [PassportModule, JwtModule.register({}), UseCaseModule],
  controllers: [...restControllers],
})
export class SessionModule {}
