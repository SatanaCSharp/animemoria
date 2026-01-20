import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@packages/nest-shared/auth';

const AT_SECRET = 'access-token-secret-key-change-in-production';
const RT_SECRET = 'refresh-token-secret-key-change-in-production';
const AT_EXPIRES_IN = '15m';
const RT_EXPIRES_IN = '7d';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async getTokens(
    accountId: string,
    email: string,
    sessionId: string,
  ): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: accountId,
      email,
      sessionId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: AT_SECRET,
        expiresIn: AT_EXPIRES_IN,
      }),
      this.jwtService.signAsync(payload, {
        secret: RT_SECRET,
        expiresIn: RT_EXPIRES_IN,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
