import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { requireAuth } from 'guards/auth.guard';
import { rootRoute } from 'routes/__root';
import { ROUTES } from 'shared/constants/routes';

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.DASHBOARD,
  component: lazyRouteComponent(() => import('./page'), 'Dashboard'),
  beforeLoad: ({ context }) => {
    requireAuth(context);
  },
});
