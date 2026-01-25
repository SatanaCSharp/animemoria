import { SingleSelect } from '@packages/ui-shared/dropdowns';
import { JSX, useState, ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

type Languages = 'en' | 'uk';

const languageItems: { key: Languages; element: ReactElement }[] = [
  {
    key: 'en',
    element: (
      <div className="flex items-center gap-2">
        <span>🇬🇧</span>
        <span>English</span>
      </div>
    ),
  },
  {
    key: 'uk',
    element: (
      <div className="flex items-center gap-2">
        <span>🇺🇦</span>
        <span>Українська</span>
      </div>
    ),
  },
];

export const LanguageSwitcher = (): JSX.Element => {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<Languages>('en');

  const changeLanguage = (lng: string): void => {
    setSelectedLang(lng as Languages);
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <SingleSelect
        selectedValue={selectedLang}
        items={languageItems}
        onChange={changeLanguage}
      />
    </div>
  );
};
