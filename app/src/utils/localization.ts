// Simple translation system following SubHub's established patterns
export type SupportedLanguage = 'en' | 'it';

// Simple translation object - no over-engineering
export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    subscriptions: 'Subscriptions',
    reports: 'Reports',
    categories: 'Categories',
    settings: 'Settings',
    help: 'Help',
    
    // Common buttons
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    
    // Subscription terms
    cost: 'Cost',
    frequency: 'Frequency',
    monthly: 'Monthly',
    yearly: 'Yearly',
    nextBilling: 'Next Billing',
    
    // Messages
    loading: 'Loading...',
    noData: 'No data available',
    comingSoon: 'Coming Soon',
    
    // Settings
    language: 'Language',
    currency: 'Currency',
    theme: 'Theme',

    // Additional UI
    profile: 'Profile',
    notifications: 'Notifications',
    appearance: 'Appearance',
    privacy: 'Privacy',
    logout: 'Logout',
    welcome: 'Welcome'
  },
  it: {
    // Navigation
    dashboard: 'Dashboard',
    subscriptions: 'Abbonamenti',
    reports: 'Report',
    categories: 'Categorie',
    settings: 'Impostazioni',
    help: 'Aiuto',
    
    // Common buttons
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    add: 'Aggiungi',
    search: 'Cerca',
    
    // Subscription terms
    cost: 'Costo',
    frequency: 'Frequenza',
    monthly: 'Mensile',
    yearly: 'Annuale',
    nextBilling: 'Prossima Fatturazione',
    
    // Messages
    loading: 'Caricamento...',
    noData: 'Nessun dato disponibile',
    comingSoon: 'Prossimamente',
    
    // Settings
    language: 'Lingua',
    currency: 'Valuta',
    theme: 'Tema',

    // Additional UI
    profile: 'Profilo',
    notifications: 'Notifiche',
    appearance: 'Aspetto',
    privacy: 'Privacy',
    logout: 'Esci',
    welcome: 'Benvenuto'
  }
};

// Simple translation function
export const t = (key: string, language: SupportedLanguage = 'en'): string => {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key; // Fallback to key if translation not found
};

// Simple currency formatting - following existing utility pattern
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  try {
    const locale = currency === 'EUR' ? 'it-IT' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const symbol = currency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  }
};

// Get user's language from localStorage or browser (simple detection)
export const getUserLanguage = (): SupportedLanguage => {
  try {
    // Check localStorage first
    const saved = localStorage.getItem('subhub-language') as SupportedLanguage;
    if (saved && (saved === 'en' || saved === 'it')) {
      return saved;
    }
    
    // Simple browser detection - prioritize Italian
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('it') ? 'it' : 'en';
  } catch {
    return 'en'; // Safe fallback
  }
};

// Save user's language preference
export const setUserLanguage = (language: SupportedLanguage): void => {
  try {
    localStorage.setItem('subhub-language', language);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
};
