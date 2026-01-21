import { Controller } from '@nestjs/common';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
  RefreshTokensRequest,
  RefreshTokensResponse,
} from '@packages/grpc';
import { RefreshTokensCommandProcessor } from 'session/use-case/command/refresh-tokens.command';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  constructor(
    private readonly refreshTokensCommandProcessor: RefreshTokensCommandProcessor,
  ) {}

  async refreshTokens(
    request: RefreshTokensRequest,
  ): Promise<RefreshTokensResponse> {
    const { accessToken, refreshToken } =
      await this.refreshTokensCommandProcessor.process({
        accountId: request.accountId,
        sessionId: request.sessionId,
        oldRefreshToken: request.refreshToken,
      });
    return { accessToken, refreshToken };
  }
}
