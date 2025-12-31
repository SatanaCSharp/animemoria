import { createRoute } from '@tanstack/react-router';

import { Home } from '@/modules/home/Home';
import { rootRoute } from '@/routes/__root';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});
