import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GqlAuthGuard } from 'auth/guards/gql-auth.guard';
import { JwtGuard } from 'auth/guards/jwt.guard';
import { JwtRtGuard } from 'auth/guards/jwt-rt.guard';
import { JwtStrategy } from 'auth/strategies/jwt.strategy';
import { JwtRtStrategy } from 'auth/strategies/jwt-rt.strategy';
import { ConfigModule } from 'config';

export type AuthModuleOptions = {
  /**
   * Whether to enable refresh token strategy
   * Default: true
   */
  enableRefreshToken?: boolean;
};

@Module({})
export class AuthModule {
  static forRoot(options?: AuthModuleOptions): DynamicModule {
    const enableRefreshToken = options?.enableRefreshToken ?? true;

    const providers: Provider[] = [
      {
        provide: JwtStrategy,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const atSecret = config.getOrThrow<string>('AT_SECRET');
          return new JwtStrategy(atSecret);
        },
      },
      JwtGuard,
      GqlAuthGuard,
    ];

    if (enableRefreshToken) {
      providers.push(
        {
          provide: JwtRtStrategy,
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const rtSecret = config.getOrThrow<string>('RT_SECRET');
            return new JwtRtStrategy(rtSecret);
          },
        },
        JwtRtGuard,
      );
    }

    return {
      module: AuthModule,
      imports: [ConfigModule, PassportModule, JwtModule.register({})],
      providers,
      exports: providers,
    };
  }
}
