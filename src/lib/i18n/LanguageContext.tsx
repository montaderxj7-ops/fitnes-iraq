"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    // Check localStorage first
    const storedLang = localStorage.getItem('app-language') as Language;
    if (storedLang && ['ar', 'en', 'ku'].includes(storedLang)) {
      setLanguageState(storedLang);
    } else {
      // Default to Arabic always, ignoring system language
      setLanguageState('ar');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-language', lang);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    let result = key;
    
    const translation = translations[language] as any;
    if (translation && translation[key]) {
      result = translation[key];
    } else if ((translations.en as any)[key]) {
      result = (translations.en as any)[key];
    } else if ((translations.ar as any)[key]) {
      result = (translations.ar as any)[key];
    }
    
    if (params && result !== key) {
      Object.keys(params).forEach(paramKey => {
        result = result.replace(new RegExp(`{${paramKey}}`, 'g'), String(params[paramKey]));
      });
    }
    
    return result;
  };

  const dir = language === 'en' ? 'ltr' : 'rtl';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      <div dir={dir} className={`w-full h-full ${language === 'en' ? 'font-sans' : 'font-cairo'}`}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
