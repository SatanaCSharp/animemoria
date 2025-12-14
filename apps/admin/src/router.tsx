import { createRouter } from '@tanstack/react-router';

import { rootRoute } from '@/routes/__root';
import { indexRoute } from '@/routes/index';

// Declarative route tree
const routeTree = rootRoute.addChildren([indexRoute]);

// Create a new router instance
export const getRouter = (): ReturnType<typeof createRouter> => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
