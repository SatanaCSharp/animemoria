import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from 'routes/__root';

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('./page'), 'Home'),
});
