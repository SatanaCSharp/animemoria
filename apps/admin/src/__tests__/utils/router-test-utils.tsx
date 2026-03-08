import {
  createRouter,
  createRootRouteWithContext,
  Outlet,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router';
import { render, RenderOptions } from '@testing-library/react';

import type { Router } from '@tanstack/react-router';
import type { RouterContext } from 'context/router.context';

/**
 * TanStack Router test utilities.
 * Uses a real router instance with createRootRoute (or createRootRouteWithContext),
 * createMemoryHistory, and createRouter so loaders, search params, and nested
 * routing are respected. beforeLoad guards (e.g. requireAuth) run in the real router;
 * redirect() requires global Response (not in jsdom), so guard specs that assert
 * redirect behavior use a local jest.mock('@tanstack/react-router') for the redirect
 * call only. See: https://tanstack.com/router/latest/docs/how-to/setup-testing
 */

export const testRootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <Outlet />,
});

export interface CreateTestRouterOptions {
  initialLocation?: string;
  context?: RouterContext;
}

/**
 * Creates a real router for tests with the given routes and optional context.
 * @param routes - Child routes with getParentRoute: () => testRootRoute
 * @param options
 */
export function createTestRouter(
  routes: unknown[],
  options: CreateTestRouterOptions = {},
): Router<never> {
  const { initialLocation = '/', context } = options;
  const routeTree = testRootRoute.addChildren(routes as never);
  const history = createMemoryHistory({ initialEntries: [initialLocation] });

  return createRouter({
    routeTree,
    history,
    ...(context !== null && { context }),
    defaultPreloadStaleTime: 0,
  } as never);
}

export interface RenderWithRouterOptions extends Omit<
  RenderOptions,
  'wrapper'
> {
  /** Child routes with getParentRoute: () => testRootRoute */
  routes: unknown[];
  initialLocation?: string;
  context?: RouterContext;
}

/**
 * Renders a real router with the given routes and initial location.
 * Redirects from beforeLoad (e.g. requireAuth, requireAnonymous) are applied by the router.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function renderWithRouter(
  options: RenderWithRouterOptions = { routes: [] },
) {
  const { routes, initialLocation = '/', context, ...renderOptions } = options;

  const router = createTestRouter(routes, { initialLocation, context });

  return {
    ...render(<RouterProvider router={router as never} />, renderOptions),
    router,
  };
}
