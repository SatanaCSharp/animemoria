import { ReactNode } from 'react';

import { LanguageSwitcher } from 'shared/components/Localization/LanguageSwitcher';

export const Header = (): ReactNode => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-gray-800">
          AniMemoria | Admin
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};
