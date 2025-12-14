import { createRootRoute, Outlet } from '@tanstack/react-router';
import { JSX } from 'react';

const RootComponent = (): JSX.Element => {
  return <Outlet />;
};

export const rootRoute = createRootRoute({
  component: RootComponent,
});
