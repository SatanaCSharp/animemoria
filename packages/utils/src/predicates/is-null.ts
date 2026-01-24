import { Maybe } from '@packages/shared-types/utils';

export function isNull<T>(value: Maybe<T>): value is null {
  return value === null;
}
