import { createRootRoute } from '@tanstack/react-router';
import { RootLayout } from 'shared/layouts/RootLayout';

export const rootRoute = createRootRoute({
  component: RootLayout,
});
