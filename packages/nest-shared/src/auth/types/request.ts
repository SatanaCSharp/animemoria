import { JwtRtStrategyPayload } from 'auth/types/jwt';
import type { Request } from 'express';

export interface RequestWithUser extends Request {
  user: JwtRtStrategyPayload;
}
