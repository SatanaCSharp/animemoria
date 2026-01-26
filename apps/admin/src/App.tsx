import { ApolloClient } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { UIProvider } from '@packages/ui-shared/hero-ui';
import { createRouter } from '@tanstack/react-router';
import { ReactElement, StrictMode } from 'react';

import { AuthProvider } from 'context/auth.context';
import { RouterProvider } from 'context/router.context';

type AppProps = {
  client: ApolloClient;
  router: ReturnType<typeof createRouter>;
};

export const App = (props: AppProps): ReactElement => {
  return (
    <StrictMode>
      <UIProvider>
        <ApolloProvider client={props.client}>
          <AuthProvider>
            <RouterProvider router={props.router} />
          </AuthProvider>
        </ApolloProvider>
      </UIProvider>
    </StrictMode>
  );
};
