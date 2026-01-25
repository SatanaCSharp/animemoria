import { createRootRouteWithContext } from '@tanstack/react-router';

import { RouterContext } from 'context/router.context';
import { RootLayout } from 'shared/layouts/RootLayout';

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: () => <RootLayout />,
});
