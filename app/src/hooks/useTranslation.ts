import { useState, useEffect } from 'react';
import { t, getUserLanguage, SupportedLanguage } from '../utils/localization';

export const useTranslation = () => {
  const [language, setLanguage] = useState<SupportedLanguage>(getUserLanguage());

  // Listen for language changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'subhub-language' && e.newValue) {
        setLanguage(e.newValue as SupportedLanguage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Translation function that uses current language with fallback and interpolation support
  const translate = (key: string, fallbackOrParams?: string | Record<string, string | number>): string => {
    // If second parameter is an object, it's interpolation params
    if (typeof fallbackOrParams === 'object') {
      return t(key, language, fallbackOrParams);
    }

    // Otherwise it's a fallback string
    const translation = t(key, language);
    // If translation is the same as key (not found), use fallback if provided
    return translation === key && fallbackOrParams ? fallbackOrParams : translation;
  };

  return {
    language,
    t: translate
  };
};
