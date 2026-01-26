import { SystemError } from '@packages/shared-types/errors';
import { assertDefined } from '@packages/utils/asserts';
import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const TOKEN_KEY = 'token';

export interface AuthContextValue {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  getIsAuthenticated: () => boolean;
}

export const defaultAuthContextValue: AuthContextValue = {
  token: null,
  setToken: () => {},
  clearToken: () => {},
  getIsAuthenticated: () => false,
};

const AuthContext = createContext<AuthContextValue>(defaultAuthContextValue);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = (props: AuthProviderProps): ReactElement => {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  );

  const setToken = useCallback((newToken: string): void => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setTokenState(newToken);
  }, []);

  const clearToken = useCallback((): void => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  }, []);

  const getIsAuthenticated = useCallback((): boolean => {
    return !!token;
  }, [token]);

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      clearToken,
      getIsAuthenticated,
    }),
    [token, setToken, clearToken, getIsAuthenticated],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);

  assertDefined(
    context,
    new SystemError('useAuthContext must be used within AuthProvider'),
  );

  return context;
};
