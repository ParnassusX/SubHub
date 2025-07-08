// Budget Settings Component - Main container for budget management
import React, { useState, useEffect } from 'react';
import { useBudget } from '../../hooks/useBudget';
import { useBudgetFormErrorHandler } from '../../hooks/useBudgetErrorHandler';
import { useCurrency } from '../../hooks/useCurrency';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  validateBudgetForm, 
  convertApiDataToFormFormat, 
  convertFormDataToApiFormat 
} from '../../utils/budgetValidation';
import { BudgetFormData } from '../../types/budget';

// Import budget components (will be created next)
import BudgetOverviewCard from './BudgetOverviewCard';
import MonthlyBudgetSection from './MonthlyBudgetSection';
import YearlyBudgetSection from './YearlyBudgetSection';
import CategoryBudgetEditor from './CategoryBudgetEditor';
import BudgetAlertSettings from './BudgetAlertSettings';
import BudgetActionButtons from './BudgetActionButtons';

const BudgetSettings: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice: _formatPrice, currency } = useCurrency();
  const {
    monthlyBudget,
    yearlyBudget,
    categoryBudgets,
    budgetAlertsEnabled,
    monthlySpending,
    yearlySpending,
    updateBudget,
    resetBudget,
    isLoading: budgetLoading
  } = useBudget();

  const {
    error: _error,
    hasError,
    errorMessage,
    clearError,
    getFieldError,
    hasFieldError: _hasFieldError,
    handleFormSubmit
  } = useBudgetFormErrorHandler();

  // Form state
  const [formData, setFormData] = useState<BudgetFormData>({
    monthlyBudget: '',
    yearlyBudget: '',
    categoryBudgets: {},
    budgetAlertsEnabled: true
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Available categories (from existing subscriptions or predefined list)
  const [availableCategories] = useState<string[]>([
    'Entertainment',
    'Productivity',
    'Health & Fitness',
    'Education',
    'Business',
    'Other'
  ]);

  // Load initial data
  useEffect(() => {
    if (!budgetLoading) {
      const initialFormData = convertApiDataToFormFormat({
        monthlyBudget,
        yearlyBudget,
        categoryBudgets,
        budgetAlertsEnabled
      });
      setFormData(initialFormData);
      setHasChanges(false);
    }
  }, [monthlyBudget, yearlyBudget, categoryBudgets, budgetAlertsEnabled, budgetLoading]);

  // Handle form field changes
  const handleFieldChange = (field: keyof BudgetFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
    clearError();
  };

  // Handle category budget changes
  const handleCategoryBudgetChange = (category: string, amount: string) => {
    setFormData(prev => ({
      ...prev,
      categoryBudgets: {
        ...prev.categoryBudgets,
        [category]: amount
      }
    }));
    setHasChanges(true);
    clearError();
  };

  // Handle category addition
  const handleCategoryAdd = (category: string) => {
    if (!formData.categoryBudgets[category]) {
      handleCategoryBudgetChange(category, '');
    }
  };

  // Handle category removal
  const handleCategoryRemove = (category: string) => {
    setFormData(prev => {
      const { [category]: removed, ...rest } = prev.categoryBudgets;
      return {
        ...prev,
        categoryBudgets: rest
      };
    });
    setHasChanges(true);
  };

  // Handle form save
  const handleSave = async () => {
    setIsSaving(true);
    
    // Validate form
    const validationResult = validateBudgetForm(formData);
    
    const success = await handleFormSubmit(async () => {
      const apiData = convertFormDataToApiFormat(formData);
      await updateBudget(apiData);
    }, validationResult);

    if (success) {
      setHasChanges(false);
      setSuccessMessage(t('budgetSettingsSaved'));
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    setIsSaving(false);
  };

  // Handle form cancel
  const handleCancel = () => {
    const originalFormData = convertApiDataToFormFormat({
      monthlyBudget,
      yearlyBudget,
      categoryBudgets,
      budgetAlertsEnabled
    });
    setFormData(originalFormData);
    setHasChanges(false);
    clearError();
  };

  // Handle form reset
  const handleReset = async () => {
    if (window.confirm(t('confirmResetBudget'))) {
      setIsSaving(true);
      
      const success = await handleFormSubmit(async () => {
        await resetBudget();
      });

      if (success) {
        setHasChanges(false);
        setSuccessMessage(t('budgetReset'));
        setTimeout(() => setSuccessMessage(null), 3000);
      }

      setIsSaving(false);
    }
  };

  // Show loading state
  if (budgetLoading) {
    return (
      <div className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Budget Overview */}
      <BudgetOverviewCard
        monthlyBudget={monthlyBudget}
        yearlyBudget={yearlyBudget}
        monthlySpending={monthlySpending}
        yearlySpending={yearlySpending}
        currency={currency}
      />

      {/* Budget Configuration */}
      <div id="budget-configuration" className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] p-6">
        <h3 className="text-lg font-semibold text-white mb-6">{t('budgetConfiguration')}</h3>
        
        <div className="space-y-6">
          {/* Monthly Budget */}
          <MonthlyBudgetSection
            value={formData.monthlyBudget}
            onChange={(value) => handleFieldChange('monthlyBudget', value)}
            error={getFieldError('monthlyBudget') || undefined}
            currency={currency}
            disabled={isSaving}
          />

          {/* Yearly Budget */}
          <YearlyBudgetSection
            value={formData.yearlyBudget}
            onChange={(value) => handleFieldChange('yearlyBudget', value)}
            error={getFieldError('yearlyBudget') || undefined}
            currency={currency}
            disabled={isSaving}
          />

          {/* Category Budgets */}
          <CategoryBudgetEditor
            categories={availableCategories}
            categoryBudgets={formData.categoryBudgets}
            onBudgetChange={handleCategoryBudgetChange}
            onCategoryAdd={handleCategoryAdd}
            onCategoryRemove={handleCategoryRemove}
            currency={currency}
            errors={Object.keys(formData.categoryBudgets).reduce((acc, category) => {
              const error = getFieldError(`categoryBudgets.${category}`);
              if (error) acc[category] = error;
              return acc;
            }, {} as Record<string, string>)}
            disabled={isSaving}
          />

          {/* Budget Alerts */}
          <BudgetAlertSettings
            enabled={formData.budgetAlertsEnabled}
            onChange={(enabled) => handleFieldChange('budgetAlertsEnabled', enabled)}
            disabled={isSaving}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <BudgetActionButtons
        onSave={handleSave}
        onCancel={handleCancel}
        onReset={handleReset}
        isSaving={isSaving}
        hasChanges={hasChanges}
        disabled={isSaving}
      />
    </div>
  );
};

export default BudgetSettings;
