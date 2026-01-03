import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from 'routes/__root';

export const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: lazyRouteComponent(() => import('./page'), 'UsersPage'),
});
