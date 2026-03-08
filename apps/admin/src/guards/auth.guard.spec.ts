import { createRoute } from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import React from 'react';

import {
  renderWithRouter,
  testRootRoute,
} from '__tests__/utils/router-test-utils';
import { requireAuth } from 'guards/auth.guard';
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

describe('requireAuth', () => {
  describe('with real router (createRootRoute + createMemoryHistory)', () => {
    it('allows access when user is authenticated', async () => {
      const authContext: RouterContext = {
        auth: {
          getIsAuthenticated: () => true,
        } as RouterContext['auth'],
      };

      const protectedRoute = createRoute({
        getParentRoute: () => testRootRoute,
        path: '/protected',
        component: () => React.createElement('h1', null, 'Protected'),
        beforeLoad: ({ context }) => requireAuth(context),
      });

      const { router } = renderWithRouter({
        routes: [protectedRoute],
        initialLocation: '/protected',
        context: authContext,
      });

      expect(await screen.findByText('Protected')).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/protected');
    });
  });

  describe('guard logic', () => {
    it('throws redirect to sign-in when user is not authenticated', () => {
      const authContext: RouterContext = {
        auth: {
          getIsAuthenticated: () => false,
        } as RouterContext['auth'],
      };

      expect(() => requireAuth(authContext)).toThrow(
        `Redirect to ${ROUTES.SIGN_IN}`,
      );
    });
  });
});
