
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'en' | 'th';
const defaultLocale: Locale = 'en';

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() =>
    (localStorage.getItem('locale') as Locale) || defaultLocale
  );

  useEffect(() => {
    localStorage.setItem('locale', locale);
    // Future expansion: if you use i18n library: i18n.changeLanguage(locale)
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);
