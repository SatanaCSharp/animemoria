import { Button } from '@packages/ui-shared/buttons';
import { JSX } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from 'shared/components/LanguageSwitcher';

export const Home = (): JSX.Element => {
  const { t } = useTranslation('home');
  return (
    <div className="min-h-screen flex items-center justify-center flex-col bg-gray-100">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <h1 className="text-4xl font-bold text-gray-900">{t('hello')}</h1>
      <div className="pt-2">
        <Button> Click Me</Button>
      </div>
    </div>
  );
};
