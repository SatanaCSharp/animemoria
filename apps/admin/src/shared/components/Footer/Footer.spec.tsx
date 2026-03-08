import { render, screen } from '@testing-library/react';

import { testIds } from '__tests__/mocks/test-ids/shared/footer';
import { Footer } from 'shared/components/Footer/Footer';

describe('Footer', () => {
  it('renders current year in copyright', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByTestId(testIds.COPYRIGHT)).toHaveTextContent(
      `© ${currentYear} AniMemoria`,
    );
  });

  it('renders "All rights reserved"', () => {
    render(<Footer />);

    expect(screen.getByTestId(testIds.COPYRIGHT)).toHaveTextContent(
      'All rights reserved',
    );
  });

  it('renders footer root', () => {
    render(<Footer />);

    expect(screen.getByTestId(testIds.ROOT)).toBeInTheDocument();
  });
});
