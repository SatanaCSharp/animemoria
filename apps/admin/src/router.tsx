import { createRouter } from '@tanstack/react-router';

import { indexRoute } from '@/routes';
import { rootRoute } from '@/routes/__root';

// Declarative route tree
const routeTree = rootRoute.addChildren([indexRoute]);

export const getRouter = (): ReturnType<typeof createRouter> => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router as ReturnType<typeof createRouter>;
};
