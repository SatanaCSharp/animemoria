import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtPayload, JwtRtStrategyPayload } from 'auth/types/jwt';
import { Request } from 'express';

interface RequestWithUserPayload extends Request {
  user: JwtPayload | JwtRtStrategyPayload;
}

export const CurrentUser = createParamDecorator(
  (
    data: unknown,
    context: ExecutionContext,
  ): JwtPayload | JwtRtStrategyPayload => {
    const contextType = context.getType<'http' | 'graphql'>();

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      const request = ctx.getContext<{ req: RequestWithUserPayload }>().req;
      return request.user;
    }

    // HTTP/REST
    const request = context.switchToHttp().getRequest<RequestWithUserPayload>();
    return request.user;
  },
);
