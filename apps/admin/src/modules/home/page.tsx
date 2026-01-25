import { Button } from '@packages/ui-shared/buttons';
import { JSX } from 'react';
import { useTranslation } from 'react-i18next';

import { usePageTitle } from 'hooks/usePageTitle';

export const Home = (): JSX.Element => {
  const { t } = useTranslation('home');
  usePageTitle(t('head.title'));

  return (
    <div className="flex items-center justify-center flex-col bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-900">{t('hello')}</h1>
      <div className="pt-2">
        <Button> Click Me</Button>
      </div>
    </div>
  );
};
