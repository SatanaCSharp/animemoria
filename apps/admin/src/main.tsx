import '@packages/ui-shared/hero-ui/styles.css';
import '@/styles.css';

import { UIProvider } from '@packages/ui-shared/hero-ui';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { getRouter } from '@/router';

const router = getRouter();

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIProvider>
      <RouterProvider router={router} />
    </UIProvider>
  </StrictMode>,
);
