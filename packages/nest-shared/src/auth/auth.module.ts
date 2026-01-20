import { DynamicModule, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GqlAuthGuard } from 'auth/guards/gql-auth.guard';
import { JwtGuard } from 'auth/guards/jwt.guard';
import { JwtRtGuard } from 'auth/guards/jwt-rt.guard';
import { JwtStrategy } from 'auth/strategies/jwt.strategy';
import { JwtRtStrategy } from 'auth/strategies/jwt-rt.strategy';

export type AuthModuleOptions = {
  /**
   * Secret key for access tokens (AT)
   * Default: 'access-token-secret-key-change-in-production'
   */
  atSecret?: string;

  /**
   * Secret key for refresh tokens (RT)
   * Default: 'refresh-token-secret-key-change-in-production'
   */
  rtSecret?: string;

  /**
   * Whether to enable refresh token strategy
   * Default: true
   */
  enableRefreshToken?: boolean;
};

const DEFAULT_AT_SECRET = 'access-token-secret-key-change-in-production';
const DEFAULT_RT_SECRET = 'refresh-token-secret-key-change-in-production';

@Module({})
export class AuthModule {
  static forRoot(options?: AuthModuleOptions): DynamicModule {
    const atSecret = options?.atSecret ?? DEFAULT_AT_SECRET;
    const rtSecret = options?.rtSecret ?? DEFAULT_RT_SECRET;
    const enableRefreshToken = options?.enableRefreshToken ?? true;

    const providers: Provider[] = [
      {
        provide: JwtStrategy,
        useFactory: () => new JwtStrategy(atSecret),
      },
      JwtGuard,
      GqlAuthGuard,
    ];

    if (enableRefreshToken) {
      providers.push(
        {
          provide: JwtRtStrategy,
          useFactory: () => new JwtRtStrategy(rtSecret),
        },
        JwtRtGuard,
      );
    }

    return {
      module: AuthModule,
      imports: [PassportModule, JwtModule.register({})],
      providers,
      exports: providers,
    };
  }
}
