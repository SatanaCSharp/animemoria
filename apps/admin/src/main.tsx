import '@packages/ui-shared/hero-ui/styles.css';
import 'styles.css';

import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { createRoot } from 'react-dom/client';

import { App } from 'App';
import { getRouter } from 'router';
import 'i18n';

const router = getRouter();

const httpLink = new HttpLink({
  uri: '/graphql',
});

const authLink = new SetContextLink(({ headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
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
