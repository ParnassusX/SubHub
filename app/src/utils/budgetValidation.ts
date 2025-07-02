// Budget Validation Utilities - Client-side validation for budget data
import { 
  BudgetFormData, 
  BudgetValidationResult, 
  BudgetValidationError,
  CategoryBudget 
} from '../types/budget';
import { 
  BUDGET_LIMITS, 
  BUDGET_VALIDATION_MESSAGES 
} from '../constants/budget';

// Validation error codes
export const VALIDATION_CODES = {
  REQUIRED: 'REQUIRED',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  NEGATIVE_VALUE: 'NEGATIVE_VALUE',
  EXCEEDS_LIMIT: 'EXCEEDS_LIMIT',
  INVALID_CATEGORY: 'INVALID_CATEGORY',
  DUPLICATE_CATEGORY: 'DUPLICATE_CATEGORY',
  TOO_MANY_CATEGORIES: 'TOO_MANY_CATEGORIES'
} as const;

// Helper function to validate a single amount
export function validateAmount(
  value: string | number | null | undefined,
  fieldName: string,
  required: boolean = false
): BudgetValidationError[] {
  const errors: BudgetValidationError[] = [];

  // Check if required
  if (required && (!value || value === '')) {
    errors.push({
      field: fieldName,
      message: BUDGET_VALIDATION_MESSAGES.REQUIRED,
      code: 'REQUIRED'
    });
    return errors;
  }

  // Skip validation if empty and not required
  if (!value || value === '') {
    return errors;
  }

  // Convert to number
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if valid number
  if (isNaN(numValue)) {
    errors.push({
      field: fieldName,
      message: BUDGET_VALIDATION_MESSAGES.INVALID_AMOUNT,
      code: 'INVALID_AMOUNT'
    });
    return errors;
  }

  // Check if negative
  if (numValue < 0) {
    errors.push({
      field: fieldName,
      message: BUDGET_VALIDATION_MESSAGES.NEGATIVE_VALUE,
      code: 'NEGATIVE_VALUE'
    });
  }

  // Check if exceeds limit
  if (numValue > BUDGET_LIMITS.MAX_BUDGET) {
    errors.push({
      field: fieldName,
      message: BUDGET_VALIDATION_MESSAGES.EXCEEDS_LIMIT,
      code: 'EXCEEDS_LIMIT'
    });
  }

  return errors;
}

// Validate category name
export function validateCategoryName(categoryName: string): BudgetValidationError[] {
  const errors: BudgetValidationError[] = [];

  if (!categoryName || categoryName.trim() === '') {
    errors.push({
      field: 'categoryName',
      message: 'Category name is required',
      code: 'REQUIRED'
    });
    return errors;
  }

  // Check length
  if (categoryName.length > 50) {
    errors.push({
      field: 'categoryName',
      message: 'Category name must be 50 characters or less',
      code: 'INVALID_CATEGORY'
    });
  }

  // Check for invalid characters (basic validation)
  if (!/^[a-zA-Z0-9\s&-_]+$/.test(categoryName)) {
    errors.push({
      field: 'categoryName',
      message: 'Category name contains invalid characters',
      code: 'INVALID_CATEGORY'
    });
  }

  return errors;
}

// Validate category budgets object
export function validateCategoryBudgets(categoryBudgets: { [category: string]: string }): BudgetValidationError[] {
  const errors: BudgetValidationError[] = [];
  const categoryNames = Object.keys(categoryBudgets);

  // Check category count limit
  if (categoryNames.length > BUDGET_LIMITS.MAX_CATEGORY_BUDGETS) {
    errors.push({
      field: 'categoryBudgets',
      message: `Maximum ${BUDGET_LIMITS.MAX_CATEGORY_BUDGETS} category budgets allowed`,
      code: 'TOO_MANY_CATEGORIES'
    });
  }

  // Check for duplicate categories (case-insensitive)
  const lowerCaseNames = categoryNames.map(name => name.toLowerCase());
  const uniqueNames = new Set(lowerCaseNames);
  if (lowerCaseNames.length !== uniqueNames.size) {
    errors.push({
      field: 'categoryBudgets',
      message: 'Duplicate category names are not allowed',
      code: 'DUPLICATE_CATEGORY'
    });
  }

  // Validate each category
  categoryNames.forEach(categoryName => {
    // Validate category name
    const nameErrors = validateCategoryName(categoryName);
    errors.push(...nameErrors.map(error => ({
      ...error,
      field: `categoryBudgets.${categoryName}.name`
    })));

    // Validate category amount
    const amount = categoryBudgets[categoryName];
    const amountErrors = validateAmount(amount, `categoryBudgets.${categoryName}`, false);
    errors.push(...amountErrors);
  });

  return errors;
}

// Main budget form validation function
export function validateBudgetForm(formData: BudgetFormData): BudgetValidationResult {
  const errors: BudgetValidationError[] = [];

  // Validate monthly budget
  const monthlyErrors = validateAmount(formData.monthlyBudget, 'monthlyBudget', false);
  errors.push(...monthlyErrors);

  // Validate yearly budget
  const yearlyErrors = validateAmount(formData.yearlyBudget, 'yearlyBudget', false);
  errors.push(...yearlyErrors);

  // Validate category budgets
  const categoryErrors = validateCategoryBudgets(formData.categoryBudgets);
  errors.push(...categoryErrors);

  // Cross-validation: Check if yearly budget is reasonable compared to monthly
  if (formData.monthlyBudget && formData.yearlyBudget) {
    const monthlyAmount = parseFloat(formData.monthlyBudget);
    const yearlyAmount = parseFloat(formData.yearlyBudget);
    
    if (!isNaN(monthlyAmount) && !isNaN(yearlyAmount)) {
      const expectedYearly = monthlyAmount * 12;
      const difference = Math.abs(yearlyAmount - expectedYearly);
      const percentageDiff = (difference / expectedYearly) * 100;
      
      // Warn if yearly budget is significantly different from monthly * 12
      if (percentageDiff > 20) {
        errors.push({
          field: 'yearlyBudget',
          message: 'Yearly budget seems inconsistent with monthly budget',
          code: 'INVALID_AMOUNT'
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Real-time validation for individual fields
export function validateField(
  fieldName: keyof BudgetFormData,
  value: any,
  formData?: Partial<BudgetFormData>
): BudgetValidationError[] {
  switch (fieldName) {
    case 'monthlyBudget':
      return validateAmount(value, 'monthlyBudget', false);
    
    case 'yearlyBudget':
      return validateAmount(value, 'yearlyBudget', false);
    
    case 'categoryBudgets':
      return validateCategoryBudgets(value || {});
    
    case 'budgetAlertsEnabled':
      // Boolean field, no validation needed
      return [];
    
    default:
      return [];
  }
}

// Helper function to get error message for a specific field
export function getFieldError(
  fieldName: string,
  errors: BudgetValidationError[]
): string | null {
  const fieldError = errors.find(error => error.field === fieldName);
  return fieldError ? fieldError.message : null;
}

// Helper function to check if a field has errors
export function hasFieldError(
  fieldName: string,
  errors: BudgetValidationError[]
): boolean {
  return errors.some(error => error.field === fieldName);
}

// Helper function to get all errors for a field (including nested fields)
export function getFieldErrors(
  fieldName: string,
  errors: BudgetValidationError[]
): BudgetValidationError[] {
  return errors.filter(error => error.field.startsWith(fieldName));
}

// Format validation errors for display
export function formatValidationErrors(errors: BudgetValidationError[]): string[] {
  return errors.map(error => error.message);
}

// Check if budget data has any values set
export function hasBudgetData(formData: BudgetFormData): boolean {
  return !!(
    formData.monthlyBudget ||
    formData.yearlyBudget ||
    Object.keys(formData.categoryBudgets).length > 0
  );
}

// Convert form data to API format
export function convertFormDataToApiFormat(formData: BudgetFormData): {
  monthlyBudget: number | null;
  yearlyBudget: number | null;
  categoryBudgets: CategoryBudget;
  budgetAlertsEnabled: boolean;
} {
  return {
    monthlyBudget: formData.monthlyBudget ? parseFloat(formData.monthlyBudget) : null,
    yearlyBudget: formData.yearlyBudget ? parseFloat(formData.yearlyBudget) : null,
    categoryBudgets: Object.entries(formData.categoryBudgets).reduce((acc, [category, amount]) => {
      if (amount && amount.trim() !== '') {
        acc[category] = parseFloat(amount);
      }
      return acc;
    }, {} as CategoryBudget),
    budgetAlertsEnabled: formData.budgetAlertsEnabled
  };
}

// Convert API data to form format
export function convertApiDataToFormFormat(apiData: {
  monthlyBudget?: number | null;
  yearlyBudget?: number | null;
  categoryBudgets?: CategoryBudget;
  budgetAlertsEnabled?: boolean;
}): BudgetFormData {
  return {
    monthlyBudget: apiData.monthlyBudget?.toString() || '',
    yearlyBudget: apiData.yearlyBudget?.toString() || '',
    categoryBudgets: Object.entries(apiData.categoryBudgets || {}).reduce((acc, [category, amount]) => {
      acc[category] = amount.toString();
      return acc;
    }, {} as { [category: string]: string }),
    budgetAlertsEnabled: apiData.budgetAlertsEnabled ?? true
  };
}
