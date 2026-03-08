import { MockedProvider } from '@apollo/client/testing/react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

import type { MockLink } from '@apollo/client/testing';

/**
 * Apollo Client testing utilities.
 * MockedProvider is the recommended approach: it validates that your component
 * sends the exact query/mutation and variables defined in your code. Mocking
 * useQuery/useMutation directly can let tests pass even when the real GraphQL
 * operation is malformed. See:
 * https://www.apollographql.com/docs/react/development-testing/testing
 */

/**
 * Renders a component wrapped in MockedProvider with the given mocks.
 * Use this for components that use useQuery/useMutation so the test asserts
 * the real GraphQL operation shape and variables.
 */
export function renderWithApolloMocks(
  ui: ReactElement,
  mocks: readonly MockLink.MockedResponse[] = [],
  options: Omit<RenderOptions, 'wrapper'> = {},
): RenderResult {
  const Wrapper = ({ children }: { children: ReactNode }): ReactElement => {
    return <MockedProvider mocks={[...mocks]}>{children}</MockedProvider>;
  };
  return render(ui, { wrapper: Wrapper, ...options });
}
