import '@packages/ui-shared/hero-ui/styles.css';
import 'styles.css';

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { createRoot } from 'react-dom/client';

import { App } from 'App';
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
  <App router={router} client={client} />,
);
