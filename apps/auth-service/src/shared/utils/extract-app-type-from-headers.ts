import { ApplicationError } from '@packages/shared-types/errors';
import { Maybe } from '@packages/shared-types/utils';
import { assertDefined } from '@packages/utils/asserts';
import { stringToEnumValue } from '@packages/utils/type-guards';
import { Request } from 'express';
import { AppType } from 'shared/types/app-type.enum';

export function extractAppTypeFromRequest(req: Request): AppType {
  const appTypeHeader = req.headers['x-app-type'] as Maybe<string>;

  assertDefined(
    appTypeHeader,
    new ApplicationError('x-app-type header is required'),
  );

  return stringToEnumValue(appTypeHeader, AppType);
}
