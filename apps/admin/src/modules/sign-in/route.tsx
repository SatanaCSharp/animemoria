import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { requireAnonymous } from 'guards/anonymous-user.guard';
import { rootRoute } from 'routes/__root';

export const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sing-in',
  component: lazyRouteComponent(() => import('./page'), 'SignInPage'),
  beforeLoad: ({ context }) => {
    requireAnonymous(context);
  },
});
