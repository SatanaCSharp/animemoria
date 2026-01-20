import { Maybe } from '@packages/shared-types/utils';

export type JwtPayload = {
  sub: string;
  email: string;
  sessionId: string;
};

export type JwtStrategyPayload = JwtPayload;

export type JwtRtStrategyPayload = JwtPayload & {
  refreshToken: Maybe<string>;
};
