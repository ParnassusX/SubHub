// Monthly Budget Section Component
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../hooks/useCurrency';

interface MonthlyBudgetSectionProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  currency: string;
  disabled?: boolean;
}

const MonthlyBudgetSection: React.FC<MonthlyBudgetSectionProps> = ({
  value,
  onChange,
  error,
  currency,
  disabled = false
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [focused, setFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only numbers and decimal point
    const sanitizedValue = inputValue.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = sanitizedValue.split('.');
    const cleanValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : sanitizedValue;
    
    setDisplayValue(cleanValue);
    onChange(cleanValue);
  };

  // Handle input focus
  const handleFocus = () => {
    setFocused(true);
  };

  // Handle input blur
  const handleBlur = () => {
    setFocused(false);
    
    // Format the value on blur if it's a valid number
    if (displayValue && !isNaN(parseFloat(displayValue))) {
      const numValue = parseFloat(displayValue);
      const formattedValue = numValue.toFixed(2);
      setDisplayValue(formattedValue);
      onChange(formattedValue);
    }
  };

  // Clear the budget
  const handleClear = () => {
    setDisplayValue('');
    onChange('');
  };

  // Get formatted preview
  const getFormattedPreview = () => {
    if (!displayValue || isNaN(parseFloat(displayValue))) return '';
    return formatPrice(parseFloat(displayValue));
  };

  return (
    <div className="space-y-2">
      {/* Label and Description */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">
          {t('monthlyBudget')}
        </label>
        {displayValue && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-xs text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('clear')}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        {t('monthlyBudgetDescription', 'Set your monthly subscription spending limit')}
      </p>

      {/* Input Container */}
      <div className="relative">
        <div className={`
          flex items-center
          w-full px-3 py-2
          bg-gray-700 border rounded-md
          transition-colors duration-200
          ${error 
            ? 'border-red-500 focus-within:border-red-400' 
            : focused 
              ? 'border-blue-500' 
              : 'border-gray-600 hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          {/* Currency Symbol */}
          <span className="text-gray-400 mr-2 select-none">
            {currency === 'EUR' ? '€' : '$'}
          </span>

          {/* Input Field */}
          <input
            type="text"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="0.00"
            disabled={disabled}
            className={`
              flex-1 bg-transparent text-white placeholder-gray-500
              focus:outline-none
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
            aria-describedby={error ? 'monthly-budget-error' : 'monthly-budget-help'}
          />

          {/* Clear Button */}
          {displayValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 text-gray-400 hover:text-gray-300 transition-colors"
              aria-label={t('clearBudget')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Formatted Preview */}
        {displayValue && !focused && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <span className="text-xs text-gray-400">
              {getFormattedPreview()}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id="monthly-budget-error" className="text-sm text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {/* Help Text */}
      {!error && (
        <p id="monthly-budget-help" className="text-xs text-gray-500">
          {t('budgetHelpText', 'Leave empty to disable monthly budget tracking')}
        </p>
      )}

      {/* Budget Suggestions */}
      {!displayValue && !focused && (
        <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 mb-2">{t('budgetSuggestions', 'Suggested budgets')}:</p>
          <div className="flex flex-wrap gap-2">
            {[50, 100, 200, 500].map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  const formattedAmount = amount.toFixed(2);
                  setDisplayValue(formattedAmount);
                  onChange(formattedAmount);
                }}
                disabled={disabled}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formatPrice(amount)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyBudgetSection;
