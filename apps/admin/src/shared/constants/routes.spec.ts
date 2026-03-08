import { ROUTES } from 'shared/constants/routes';

describe('ROUTES', () => {
  it('exposes expected route constants', () => {
    expect(ROUTES.DASHBOARD).toBe('/');
    expect(ROUTES.SIGN_IN).toBe('/sing-in');
    expect(ROUTES.USERS).toBe('/users');
  });
});
