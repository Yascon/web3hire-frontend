import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const LocaleContext = createContext();

export function LocaleProvider({ children }) {
  const router = useRouter();
  const { locale, locales, pathname, asPath, query } = router;
  
  // Change locale
  const changeLocale = (newLocale) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <LocaleContext.Provider value={{ locale, locales, changeLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
