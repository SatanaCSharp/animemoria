import {
  createRouter,
  RouterProvider as TanstackRouterProvider,
} from '@tanstack/react-router';
import { ReactElement, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { TFunction } from 'i18next';

export interface RouterContext {
  t: TFunction;
}
export const defaultRouterContext: RouterContext = {
  t: ((key: string) => key) as TFunction,
};
type RouterProviderProps = {
  router: ReturnType<typeof createRouter>;
};
export const RouterProvider = (props: RouterProviderProps): ReactElement => {
  const { t } = useTranslation();
  const contextValue = useMemo(
    () => ({
      t,
    }),
    [t],
  );
  return (
    <TanstackRouterProvider router={props.router} context={contextValue} />
  );
};
