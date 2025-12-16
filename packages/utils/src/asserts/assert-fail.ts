import { assert } from 'asserts/assert';

export const assertFail = (message?: string): never => {
  assert(false, message ?? 'Assertion fail error');
  throw new Error('it has not to reach this message');
};
