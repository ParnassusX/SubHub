import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/localization';

export const useCurrency = () => {
  const { profile } = useAuth();
  const [currency, setCurrency] = useState<string>('EUR'); // Default to EUR

  useEffect(() => {
    if (profile?.currency) {
      setCurrency(profile.currency);
    } else {
      // Fallback to EUR if no profile currency is set
      setCurrency('EUR');
    }
  }, [profile?.currency]); // More specific dependency

  // Listen for currency changes from Settings page
  useEffect(() => {
    const handleCurrencyChange = (e: StorageEvent) => {
      if (e.key === 'subhub-currency' && e.newValue) {
        setCurrency(e.newValue);
      }
    };

    window.addEventListener('storage', handleCurrencyChange);
    return () => window.removeEventListener('storage', handleCurrencyChange);
  }, []);

  const formatPrice = (amount: number): string => {
    return formatCurrency(amount, currency);
  };

  return {
    currency,
    formatPrice
  };
};
