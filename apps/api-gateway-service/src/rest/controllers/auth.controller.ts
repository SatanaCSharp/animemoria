import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CurrentUser,
  JwtRtGuard,
  JwtRtStrategyPayload,
  setRefreshTokenCookie,
} from '@packages/nest-shared/auth';
import { ApplicationError } from '@packages/shared-types/errors';
import { assertDefined } from '@packages/utils/asserts';
import { isProd } from '@packages/utils/predicates';
import { Response } from 'express';
import { AuthClientService } from 'shared/client-services/auth.client-service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authClientService: AuthClientService,
    private readonly config: ConfigService,
  ) {}

  private get cookiesMaxAge(): number {
    return Number(this.config.getOrThrow('COOKIES_MAX_AGE'));
  }

  private get isSecureCookie(): boolean {
    return isProd(this.config.getOrThrow<string>('NODE_ENV'));
  }

  @Post('refresh')
  @UseGuards(JwtRtGuard)
  async refresh(
    @CurrentUser() user: JwtRtStrategyPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    assertDefined(
      user.refreshToken,
      new ApplicationError('Old Refresh token was not provided '),
    );

    const { refreshToken, accessToken } =
      await this.authClientService.refreshTokensRequest({
        accountId: user.sub,
        sessionId: user.sessionId,
        refreshToken: user.refreshToken,
      });

    setRefreshTokenCookie(res, {
      refreshToken,
      maxAgeInMs: this.cookiesMaxAge,
      isSecureCookie: this.isSecureCookie,
    });
    return { accessToken };
  }
}
