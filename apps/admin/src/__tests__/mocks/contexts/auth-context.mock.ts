export interface MockAuthContextValue {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  getIsAuthenticated: () => boolean;
}

export const mockAuthContextValue: MockAuthContextValue = {
  token: null,
  setToken: jest.fn(),
  clearToken: jest.fn(),
  getIsAuthenticated: jest.fn().mockReturnValue(false),
};

export const useAuthContext = jest.fn(() => mockAuthContextValue);
