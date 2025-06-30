# 🚀 Immediate Settings Implementation Plan

**Priority**: Critical Settings Fixes  
**Timeline**: 1-2 weeks  
**Focus**: Currency, Theme, Date Formatting

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Currency Formatting System (Days 1-2)**

#### **✅ Task 1.1: Create Currency Utilities**
```typescript
// File: app/src/utils/currency.ts
export interface CurrencyConfig {
  symbol: string;
  locale: string;
  name: string;
}

export const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  USD: { symbol: '$', locale: 'en-US', name: 'US Dollar' },
  EUR: { symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound' },
  CAD: { symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' }
};

export const formatCurrency = (
  amount: number, 
  currency: string = 'USD'
): string => {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    return `${config.symbol}${amount.toFixed(2)}`;
  }
};

export const getCurrencySymbol = (currency: string): string => {
  return CURRENCY_CONFIG[currency]?.symbol || '$';
};
```

#### **✅ Task 1.2: Create Currency Hook**
```typescript
// File: app/src/hooks/useCurrency.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

export const useCurrency = () => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState<string>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserCurrency = async () => {
      if (user?.profile?.currency) {
        setCurrency(user.profile.currency);
      } else {
        // Detect from browser locale as fallback
        const browserCurrency = detectBrowserCurrency();
        setCurrency(browserCurrency);
      }
      setIsLoading(false);
    };

    loadUserCurrency();
  }, [user]);

  const formatPrice = (amount: number): string => {
    return formatCurrency(amount, currency);
  };

  const getSymbol = (): string => {
    return getCurrencySymbol(currency);
  };

  return {
    currency,
    setCurrency,
    formatPrice,
    getSymbol,
    isLoading
  };
};

const detectBrowserCurrency = (): string => {
  try {
    const locale = navigator.language || 'en-US';
    if (locale.startsWith('en-GB')) return 'GBP';
    if (locale.startsWith('en-CA')) return 'CAD';
    if (locale.includes('DE') || locale.includes('FR') || locale.includes('ES')) return 'EUR';
    return 'USD';
  } catch {
    return 'USD';
  }
};
```

#### **✅ Task 1.3: Update Components to Use Currency**

**Files to Update**:
1. `app/src/components/SubscriptionListItem.tsx`
2. `app/src/components/SubscriptionList.tsx`
3. `app/src/pages/Dashboard.tsx`
4. `app/src/pages/Reports.tsx`
5. `app/src/components/EnhancedCharts.tsx`

**Example Update**:
```typescript
// Before:
<p className="text-lg font-semibold text-green-400">
  ${subscription.cost.toFixed(2)}
</p>

// After:
import { useCurrency } from '../hooks/useCurrency';

const { formatPrice } = useCurrency();

<p className="text-lg font-semibold text-green-400">
  {formatPrice(subscription.cost)}
</p>
```

### **Phase 2: Theme System Implementation (Days 3-5)**

#### **✅ Task 2.1: Create Theme Context**
```typescript
// File: app/src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Load user's theme preference
  useEffect(() => {
    const loadTheme = async () => {
      if (user?.preferences?.theme) {
        setTheme(user.preferences.theme as Theme);
      } else {
        // Detect system preference
        const systemTheme = detectSystemTheme();
        setTheme(systemTheme);
      }
      setIsLoading(false);
    };

    loadTheme();
  }, [user]);

  // Resolve theme (handle 'system' option)
  useEffect(() => {
    const resolveTheme = () => {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    resolveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        resolveTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const updateTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Save to user preferences
    if (user) {
      try {
        await SettingsService.updatePreferences({ theme: newTheme });
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme,
      setTheme: updateTheme,
      isLoading
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

const detectSystemTheme = (): Theme => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
};
```

#### **✅ Task 2.2: Create CSS Variables System**
```css
/* File: app/src/styles/themes.css */
:root {
  /* Dark theme (default) */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-elevated: #475569;
  
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  --text-tertiary: #64748b;
  
  --border-primary: #334155;
  --border-secondary: #475569;
  
  --accent-primary: #3b82f6;
  --accent-secondary: #1d4ed8;
  
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #06b6d4;
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-elevated: #e2e8f0;
  
  --text-primary: #1e293b;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  
  --border-primary: #e2e8f0;
  --border-secondary: #cbd5e1;
  
  --accent-primary: #3b82f6;
  --accent-secondary: #1d4ed8;
  
  --success: #059669;
  --warning: #d97706;
  --error: #dc2626;
  --info: #0891b2;
}

/* Smooth transitions for theme changes */
* {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
```

#### **✅ Task 2.3: Update Tailwind Configuration**
```javascript
// File: app/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        background: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          elevated: 'var(--bg-elevated)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
        },
        semantic: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          error: 'var(--error)',
          info: 'var(--info)',
        }
      }
    }
  },
  plugins: []
};
```

### **Phase 3: Date Formatting System (Day 6)**

#### **✅ Task 3.1: Create Date Utilities**
```typescript
// File: app/src/utils/dateFormat.ts
import { format, parseISO } from 'date-fns';

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export const formatDate = (
  date: string | Date,
  dateFormat: DateFormat = 'MM/DD/YYYY',
  timezone?: string
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return format(dateObj, 'MM/dd/yyyy');
      case 'DD/MM/YYYY':
        return format(dateObj, 'dd/MM/yyyy');
      case 'YYYY-MM-DD':
        return format(dateObj, 'yyyy-MM-dd');
      default:
        return format(dateObj, 'MM/dd/yyyy');
    }
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

export const formatDateTime = (
  date: string | Date,
  dateFormat: DateFormat = 'MM/DD/YYYY',
  includeTime: boolean = false
): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const timeFormat = includeTime ? ' HH:mm' : '';
    
    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return format(dateObj, `MM/dd/yyyy${timeFormat}`);
      case 'DD/MM/YYYY':
        return format(dateObj, `dd/MM/yyyy${timeFormat}`);
      case 'YYYY-MM-DD':
        return format(dateObj, `yyyy-MM-dd${timeFormat}`);
      default:
        return format(dateObj, `MM/dd/yyyy${timeFormat}`);
    }
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return 'Invalid Date';
  }
};
```

#### **✅ Task 3.2: Create Date Hook**
```typescript
// File: app/src/hooks/useDateFormat.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatDate, formatDateTime, DateFormat } from '../utils/dateFormat';

export const useDateFormat = () => {
  const { user } = useAuth();
  const [dateFormat, setDateFormat] = useState<DateFormat>('MM/DD/YYYY');
  const [timezone, setTimezone] = useState<string>('UTC');

  useEffect(() => {
    if (user?.profile?.date_format) {
      setDateFormat(user.profile.date_format as DateFormat);
    }
    if (user?.profile?.timezone) {
      setTimezone(user.profile.timezone);
    }
  }, [user]);

  const formatUserDate = (date: string | Date): string => {
    return formatDate(date, dateFormat, timezone);
  };

  const formatUserDateTime = (date: string | Date, includeTime: boolean = false): string => {
    return formatDateTime(date, dateFormat, includeTime);
  };

  return {
    dateFormat,
    timezone,
    formatUserDate,
    formatUserDateTime
  };
};
```

---

## 🧪 **TESTING STRATEGY**

### **Currency Testing**:
- [ ] Test all 4 supported currencies (USD, EUR, GBP, CAD)
- [ ] Verify formatting with different amounts (0.01, 1000, 1000000)
- [ ] Test browser locale detection
- [ ] Verify user preference persistence

### **Theme Testing**:
- [ ] Test light/dark/system theme switching
- [ ] Verify CSS variables apply correctly
- [ ] Test system theme change detection
- [ ] Check all components render correctly in both themes

### **Date Testing**:
- [ ] Test all 3 date formats
- [ ] Verify timezone handling
- [ ] Test edge cases (invalid dates, null values)
- [ ] Check consistency across all date displays

---

## 📦 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment**:
- [ ] All tests passing
- [ ] Performance impact < 5%
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness maintained

### **Post-Deployment**:
- [ ] Monitor error rates
- [ ] Verify user preference persistence
- [ ] Check theme switching performance
- [ ] Validate currency display accuracy

---

*This implementation plan provides step-by-step instructions for implementing the most critical Settings functionality within 1-2 weeks.*
