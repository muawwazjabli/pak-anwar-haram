'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.ur;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ur'); // Default Urdu RTL

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pah_lang', lang);
      document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('pah_lang') as Language;
    if (saved && (saved === 'ur' || saved === 'en')) {
      setLanguage(saved);
    } else {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ur');
    }
  }, []);

  const t = translations[language];
  const dir = language === 'ur' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
