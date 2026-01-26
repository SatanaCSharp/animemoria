import { createRouter } from '@tanstack/react-router';

import { defaultRouterContext } from 'context/router.context';
import { dashboardRoute } from 'modules/dashboard/route';
import { signInRoute } from 'modules/sign-in/route';
import { usersRoute } from 'modules/users/route';
import { rootRoute } from 'routes/__root';

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  usersRoute,
  signInRoute,
]);

export const getRouter = (): ReturnType<typeof createRouter> => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: defaultRouterContext,
  });

  return router as ReturnType<typeof createRouter>;
};
