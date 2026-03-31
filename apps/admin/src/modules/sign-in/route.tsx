import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { requireAnonymous } from 'guards/anonymous-user.guard';
import { rootRoute } from 'routes/__root';
import { ROUTES } from 'shared/constants/routes';

export const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.SIGN_IN,
  component: lazyRouteComponent(() => import('./page'), 'SignInPage'),
  beforeLoad: ({ context }) => {
    requireAnonymous(context);
  },
});
