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

  // Translation function that uses current language
  const translate = (key: string): string => {
    return t(key, language);
  };

  return {
    language,
    t: translate
  };
};
