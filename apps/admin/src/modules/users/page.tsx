import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { usePageTitle } from 'hooks/usePageTitle';
import { UsersList } from 'modules/users/components/UsersList';

export const UsersPage = (): ReactElement => {
  const { t } = useTranslation('users');
  usePageTitle(t('head.title'));

  return <UsersList />;
};
