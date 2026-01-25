import { ApolloClient } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { UIProvider } from '@packages/ui-shared/hero-ui';
import { createRouter } from '@tanstack/react-router';
import { ReactElement, StrictMode } from 'react';

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
          <RouterProvider router={props.router} />
        </ApolloProvider>
      </UIProvider>
    </StrictMode>
  );
};
