import {
  createRouter,
  RouterProvider as TanstackRouterProvider,
} from '@tanstack/react-router';
import { ReactElement, useMemo } from 'react';

import {
  AuthContextValue,
  defaultAuthContextValue,
  useAuthContext,
} from 'context/auth.context';

export interface RouterContext {
  auth: AuthContextValue;
}

export const defaultRouterContext: RouterContext = {
  auth: defaultAuthContextValue,
};

type RouterProviderProps = {
  router: ReturnType<typeof createRouter>;
};

export const RouterProvider = (props: RouterProviderProps): ReactElement => {
  const auth = useAuthContext();

  const contextValue = useMemo(
    () => ({
      auth,
    }),
    [auth],
  );

  return (
    <TanstackRouterProvider router={props.router} context={contextValue} />
  );
};
