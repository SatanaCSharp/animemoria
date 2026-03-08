import { createRoute } from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import React from 'react';

import {
  renderWithRouter,
  testRootRoute,
} from '__tests__/utils/router-test-utils';
import { requireAnonymous } from 'guards/anonymous-user.guard';
import { ROUTES } from 'shared/constants/routes';

import type { RouterContext } from 'context/router.context';

// Mock redirect so guard-logic test can assert throw without needing global Response (jsdom)
jest.mock('@tanstack/react-router', () => {
  const actual = jest.requireActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router',
  );
  return {
    ...actual,
    redirect: (opts: { to: string }) => {
      throw new Error(`Redirect to ${opts.to}`);
    },
  };
});

describe('requireAnonymous', () => {
  describe('with real router (createRootRoute + createMemoryHistory)', () => {
    it('allows access when user is not authenticated', async () => {
      const authContext: RouterContext = {
        auth: {
          getIsAuthenticated: () => false,
        } as RouterContext['auth'],
      };

      const publicRoute = createRoute({
        getParentRoute: () => testRootRoute,
        path: '/public',
        component: () => React.createElement('h1', null, 'Public'),
        beforeLoad: ({ context }) => requireAnonymous(context),
      });

      const { router } = renderWithRouter({
        routes: [publicRoute],
        initialLocation: '/public',
        context: authContext,
      });

      expect(await screen.findByText('Public')).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/public');
    });
  });

  describe('guard logic', () => {
    it('throws redirect to dashboard when user is authenticated', () => {
      const context: RouterContext = {
        auth: {
          getIsAuthenticated: () => true,
        } as RouterContext['auth'],
      };

      expect(() => requireAnonymous(context)).toThrow(
        `Redirect to ${ROUTES.DASHBOARD}`,
      );
    });
  });
});
