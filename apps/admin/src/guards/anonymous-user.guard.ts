import { redirect } from '@tanstack/react-router';

import { ROUTES } from 'shared/constants/routes';

import type { RouterContext } from 'context/router.context';

export const requireAnonymous = (context: RouterContext): void => {
  if (context.auth.getIsAuthenticated()) {
    throw redirect({ to: ROUTES.DASHBOARD });
  }
};
