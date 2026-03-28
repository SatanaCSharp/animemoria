import { createRoute, lazyRouteComponent } from '@tanstack/react-router';

import { requireAuth } from 'guards/auth.guard';
import { rootRoute } from 'routes/__root';
import { ROUTES } from 'shared/constants/routes';

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTES.USERS,
  component: lazyRouteComponent(() => import('./page'), 'UsersPage'),
  beforeLoad: ({ context }) => {
    requireAuth(context);
  },
});
