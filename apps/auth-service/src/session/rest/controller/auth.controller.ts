import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  JwtRtGuard,
  JwtRtStrategyPayload,
} from '@packages/nest-shared/auth';
import { Response } from 'express';
import { RefreshTokensCommandProcessor } from 'session/use-case/command/refresh-tokens.command';
import { setRefreshTokenCookie } from 'shared/utils/set-refresh-token-cookie';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly refreshTokensCommandProcessor: RefreshTokensCommandProcessor,
  ) {}

  @Post('refresh')
  @UseGuards(JwtRtGuard)
  async refresh(
    @CurrentUser() user: JwtRtStrategyPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.refreshTokensCommandProcessor.process({
      accountId: user.sub,
      sessionId: user.sessionId,
      oldRefreshToken: user.refreshToken,
    });

    setRefreshTokenCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }
}
