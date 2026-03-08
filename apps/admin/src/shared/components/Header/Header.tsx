import { ReactNode } from 'react';

import { testIds } from '__tests__/mocks/test-ids/shared/header';
import { LanguageSwitcher } from 'shared/components/Localization/LanguageSwitcher';

export const Header = (): ReactNode => {
  return (
    <header
      data-testid={testIds.ROOT}
      className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div
          data-testid={testIds.TITLE}
          className="text-xl font-bold text-gray-800"
        >
          AniMemoria | Admin
        </div>
        <div data-testid={testIds.LANGUAGE_SWITCHER}>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
