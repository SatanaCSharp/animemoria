import { screen } from '@testing-library/react';

import { testIds } from '__tests__/mocks/test-ids/shared/header';
import { render } from '__tests__/utils/test-utils';
import { Header } from 'shared/components/Header/Header';

describe('Header', () => {
  it('renders the app title', () => {
    render(<Header />);

    expect(screen.getByTestId(testIds.TITLE)).toHaveTextContent(
      'AniMemoria | Admin',
    );
  });

  it('renders header root and language switcher', () => {
    render(<Header />);

    expect(screen.getByTestId(testIds.ROOT)).toBeInTheDocument();
    expect(screen.getByTestId(testIds.LANGUAGE_SWITCHER)).toBeInTheDocument();
  });
});
