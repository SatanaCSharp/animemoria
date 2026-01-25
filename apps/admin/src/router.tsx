import { createRouter } from '@tanstack/react-router';

import { homeRoute } from 'modules/home/route';
import { usersRoute } from 'modules/users/route';
import { rootRoute } from 'routes/__root';

const routeTree = rootRoute.addChildren([homeRoute, usersRoute]);

export const getRouter = (): ReturnType<typeof createRouter> => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router as ReturnType<typeof createRouter>;
};
