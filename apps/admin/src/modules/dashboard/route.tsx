import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { requireAuth } from 'guards/auth.guard';
import { rootRoute } from 'routes/__root';

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('./page'), 'Dashboard'),
  beforeLoad: ({ context }) => {
    requireAuth(context);
  },
});
