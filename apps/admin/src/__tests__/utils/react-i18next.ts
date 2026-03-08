/**
 * Global mock for react-i18next (see jest.config.cjs moduleNameMapper).
 * Matches the official recommendation to avoid the "missing i18n instance" warning
 * that halts test execution. See: https://react.i18next.com/misc/testing
 */

export const useTranslation = (): {
  t: (i18nKey: string) => string;
  i18n: { changeLanguage: () => Promise<unknown> };
} => ({
  t: (i18nKey: string) => i18nKey,
  i18n: {
    changeLanguage: () => new Promise(() => {}),
  },
});

/** Prevents "You will need to pass in an i18next instance" warning in tests */
export const initReactI18next = {
  type: '3rdParty' as const,
  init: (): void => {},
};

export default { useTranslation, initReactI18next };
