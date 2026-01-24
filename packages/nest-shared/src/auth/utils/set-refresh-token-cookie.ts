import { Response } from 'express';

type Args = {
  refreshToken: string;
  maxAgeInMs: number;
  isSecureCookie: boolean;
};

export function setRefreshTokenCookie(res: Response, args: Args): void {
  res.cookie('refreshToken', args.refreshToken, {
    httpOnly: true,
    secure: args.isSecureCookie,
    sameSite: 'strict',
    path: '/auth/refresh',
    maxAge: args.maxAgeInMs,
  });
}
