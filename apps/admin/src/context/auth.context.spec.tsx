import { render, screen, act } from '@testing-library/react';
import { ReactElement } from 'react';

import { testIds } from '__tests__/mocks/test-ids/context/auth';
import { AuthProvider, useAuthContext } from 'context/auth.context';

const TestConsumer = (): ReactElement => {
  const auth = useAuthContext();
  return (
    <div>
      <span data-testid={testIds.AUTHENTICATED}>
        {auth.getIsAuthenticated() ? 'yes' : 'no'}
      </span>
      <span data-testid={testIds.TOKEN}>{auth.token ?? 'null'}</span>
      <button
        type="button"
        onClick={() => auth.setToken('test-token')}
        data-testid={testIds.SET_TOKEN_BUTTON}
      >
        Set token
      </button>
      <button
        type="button"
        onClick={() => auth.clearToken()}
        data-testid={testIds.CLEAR_TOKEN_BUTTON}
      >
        Clear token
      </button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides unauthenticated state by default', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId(testIds.AUTHENTICATED)).toHaveTextContent('no');
    expect(screen.getByTestId(testIds.TOKEN)).toHaveTextContent('null');
  });

  it('updates state when setToken is called', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    act(() => {
      screen.getByTestId(testIds.SET_TOKEN_BUTTON).click();
    });

    expect(screen.getByTestId(testIds.AUTHENTICATED)).toHaveTextContent('yes');
    expect(screen.getByTestId(testIds.TOKEN)).toHaveTextContent('test-token');
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('clears state when clearToken is called', () => {
    localStorage.setItem('token', 'existing');
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId(testIds.TOKEN)).toHaveTextContent('existing');

    act(() => {
      screen.getByTestId(testIds.CLEAR_TOKEN_BUTTON).click();
    });

    expect(screen.getByTestId(testIds.AUTHENTICATED)).toHaveTextContent('no');
    expect(screen.getByTestId(testIds.TOKEN)).toHaveTextContent('null');
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('initializes token from localStorage', () => {
    localStorage.setItem('token', 'stored-token');
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByTestId(testIds.AUTHENTICATED)).toHaveTextContent('yes');
    expect(screen.getByTestId(testIds.TOKEN)).toHaveTextContent('stored-token');
  });
});

describe('useAuthContext', () => {
  it('returns default (unauthenticated) value when used outside AuthProvider', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<TestConsumer />);

    expect(screen.getByTestId(testIds.AUTHENTICATED)).toHaveTextContent('no');
    expect(screen.getByTestId(testIds.TOKEN)).toHaveTextContent('null');

    consoleSpy.mockRestore();
  });
});
