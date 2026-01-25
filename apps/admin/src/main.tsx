import '@packages/ui-shared/hero-ui/styles.css';
import 'styles.css';

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { UIProvider } from '@packages/ui-shared/hero-ui';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { getRouter } from 'router';
import 'i18n';

const router = getRouter();

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4101/graphql' }),
  cache: new InMemoryCache(),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIProvider>
      <ApolloProvider client={client}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </UIProvider>
  </StrictMode>,
);
