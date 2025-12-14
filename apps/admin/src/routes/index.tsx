import { createRoute } from '@tanstack/react-router';
import { JSX } from 'react';

import { rootRoute } from '@/routes/__root';

const Home = (): JSX.Element => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900">Hello World</h1>
    </div>
  );
};

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});
