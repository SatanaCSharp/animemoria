import { Response } from 'express';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

export function setRefreshTokenCookie(
  res: Response,
  refreshToken: string,
): void {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth/refresh',
    maxAge: SEVEN_DAYS_IN_MS,
  });
}
