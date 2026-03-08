import { UIProvider } from '@packages/ui-shared/hero-ui';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

const AllTheProviders = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => <UIProvider>{children}</UIProvider>;

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
