import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '@packages/nest-shared/auth';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

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
        secret: this.config.getOrThrow('AT_SECRET'),
        expiresIn: this.config.getOrThrow('AT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow('RT_SECRET'),
        expiresIn: this.config.getOrThrow('RT_EXPIRES_IN'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
