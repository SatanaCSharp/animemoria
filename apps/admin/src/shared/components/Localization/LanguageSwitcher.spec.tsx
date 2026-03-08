import { screen } from '@testing-library/react';

import { testIds } from '__tests__/mocks/test-ids/shared/language-switcher';
import { render } from '__tests__/utils/test-utils';
import { LanguageSwitcher } from 'shared/components/Localization/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  it('renders root and select', () => {
    render(<LanguageSwitcher />);

    expect(screen.getByTestId(testIds.ROOT)).toBeInTheDocument();
    expect(screen.getByTestId(testIds.SELECT)).toBeInTheDocument();
  });

  it('renders with i18n from global mock', () => {
    render(<LanguageSwitcher />);
    expect(screen.getByTestId(testIds.ROOT)).toBeInTheDocument();
  });
});
