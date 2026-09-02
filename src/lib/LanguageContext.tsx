import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations, type LanguageCode } from './i18n';

type LanguageContextType = {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('crophealth_lang') as LanguageCode | null;
    return saved && saved in translations ? saved : 'en';
  });

  const setLang = useCallback((nextLang: LanguageCode) => {
    setLangState(nextLang);
    localStorage.setItem('crophealth_lang', nextLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[lang]?.[key] ?? translations.en[key] ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
