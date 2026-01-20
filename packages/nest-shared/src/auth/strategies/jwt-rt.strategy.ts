import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Maybe } from '@packages/shared-types/utils';
import { JwtPayload, JwtRtStrategyPayload } from 'auth/types/jwt';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtRtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(rtSecret: string) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const cookies = request?.cookies as Maybe<Record<string, string>>;
          return cookies?.['refreshToken'] ?? null;
        },
      ]),
      secretOrKey: rtSecret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtRtStrategyPayload {
    const cookies = req?.cookies as Maybe<Record<string, string>>;
    const refreshToken = cookies?.['refreshToken'];

    return {
      ...payload,
      refreshToken,
    };
  }
}
