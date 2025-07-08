// Budget Error Handler Hook
import { useState, useCallback } from 'react';
import { 
  BudgetError, 
  BudgetErrorType, 
  handleBudgetError, 
  formatErrorForUser, 
  logBudgetError,
  retryBudgetOperation,
  safeBudgetOperation
} from '../utils/budgetErrorHandling';
import { BudgetValidationError } from '../types/budget';

interface ErrorState {
  error: BudgetError | null;
  isRetrying: boolean;
  retryCount: number;
}

interface UseBudgetErrorHandlerReturn {
  // Error state
  error: BudgetError | null;
  isRetrying: boolean;
  retryCount: number;
  hasError: boolean;
  
  // Error information
  errorTitle: string;
  errorMessage: string;
  errorSuggestion: string;
  canRetry: boolean;
  
  // Error actions
  setError: (error: any) => void;
  clearError: () => void;
  retry: (operation: () => Promise<any>) => Promise<boolean>;
  
  // Safe operation wrapper
  executeWithErrorHandling: <T>(
    operation: () => Promise<T>,
    context: string
  ) => Promise<{ success: true; data: T } | { success: false; error: BudgetError }>;
  
  // Validation error helpers
  getFieldError: (fieldName: string) => string | null;
  hasFieldError: (fieldName: string) => boolean;
  getValidationErrors: () => BudgetValidationError[];
}

export const useBudgetErrorHandler = (): UseBudgetErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0
  });

  // Set error
  const setError = useCallback((error: any) => {
    const budgetError = handleBudgetError(error);
    logBudgetError(budgetError, 'useBudgetErrorHandler');
    
    setErrorState(prev => ({
      ...prev,
      error: budgetError,
      isRetrying: false
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0
    });
  }, []);

  // Retry operation
  const retry = useCallback(async (operation: () => Promise<any>): Promise<boolean> => {
    if (!errorState.error) return false;

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    try {
      await retryBudgetOperation(operation, 1); // Single retry attempt
      clearError();
      return true;
    } catch (error) {
      setError(error);
      return false;
    } finally {
      setErrorState(prev => ({
        ...prev,
        isRetrying: false
      }));
    }
  }, [errorState.error, clearError, setError]);

  // Execute operation with error handling
  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<{ success: true; data: T } | { success: false; error: BudgetError }> => {
    clearError();

    const result = await safeBudgetOperation(operation, context, setError);

    // Error is already set by safeBudgetOperation, no need to set it again
    return result;
  }, [clearError, setError]);

  // Get field-specific error
  const getFieldError = useCallback((fieldName: string): string | null => {
    if (!errorState.error?.validationErrors) return null;
    
    const fieldError = errorState.error.validationErrors.find(
      error => error.field === fieldName
    );
    
    return fieldError ? fieldError.message : null;
  }, [errorState.error]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return getFieldError(fieldName) !== null;
  }, [getFieldError]);

  // Get all validation errors
  const getValidationErrors = useCallback((): BudgetValidationError[] => {
    return errorState.error?.validationErrors || [];
  }, [errorState.error]);

  // Format error for display
  const formattedError = errorState.error ? formatErrorForUser(errorState.error) : null;

  return {
    // Error state
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    hasError: !!errorState.error,
    
    // Error information
    errorTitle: formattedError?.title || '',
    errorMessage: formattedError?.message || '',
    errorSuggestion: formattedError?.suggestion || '',
    canRetry: formattedError?.canRetry || false,
    
    // Error actions
    setError,
    clearError,
    retry,
    
    // Safe operation wrapper
    executeWithErrorHandling,
    
    // Validation error helpers
    getFieldError,
    hasFieldError,
    getValidationErrors
  };
};

// Hook for handling specific budget operations
export const useBudgetOperationHandler = () => {
  const errorHandler = useBudgetErrorHandler();
  
  // Handle budget update operation
  const handleBudgetUpdate = useCallback(async (
    updateOperation: () => Promise<any>
  ): Promise<boolean> => {
    const result = await errorHandler.executeWithErrorHandling(
      updateOperation,
      'budget_update'
    );
    
    return result.success;
  }, [errorHandler]);

  // Handle budget load operation
  const handleBudgetLoad = useCallback(async <T>(
    loadOperation: () => Promise<T>
  ): Promise<T | null> => {
    const result = await errorHandler.executeWithErrorHandling(
      loadOperation,
      'budget_load'
    );
    
    return result.success ? result.data : null;
  }, [errorHandler]);

  // Handle budget validation
  const handleBudgetValidation = useCallback((
    validationResult: { isValid: boolean; errors: BudgetValidationError[] }
  ): boolean => {
    if (!validationResult.isValid) {
      const validationError = new BudgetError(
        'Validation failed',
        BudgetErrorType.VALIDATION_ERROR,
        'VALIDATION_FAILED',
        validationResult,
        validationResult.errors
      );
      
      errorHandler.setError(validationError);
      return false;
    }
    
    errorHandler.clearError();
    return true;
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleBudgetUpdate,
    handleBudgetLoad,
    handleBudgetValidation
  };
};

// Hook for form-specific error handling
export const useBudgetFormErrorHandler = () => {
  const errorHandler = useBudgetErrorHandler();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Set field-specific error
  const setFieldError = useCallback((fieldName: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: message
    }));
  }, []);

  // Clear field-specific error
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldErrors(prev => {
      const { [fieldName]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  // Clear all field errors
  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  // Get field error (prioritizes form-level errors over validation errors)
  const getFieldError = useCallback((fieldName: string): string | null => {
    return fieldErrors[fieldName] || errorHandler.getFieldError(fieldName);
  }, [fieldErrors, errorHandler]);

  // Check if field has error
  const hasFieldError = useCallback((fieldName: string): boolean => {
    return !!(fieldErrors[fieldName] || errorHandler.hasFieldError(fieldName));
  }, [fieldErrors, errorHandler]);

  // Handle form submission with validation
  const handleFormSubmit = useCallback(async (
    submitOperation: () => Promise<any>,
    validationResult?: { isValid: boolean; errors: BudgetValidationError[] }
  ): Promise<boolean> => {
    // Clear previous field errors
    clearAllFieldErrors();
    
    // Validate if validation result provided
    if (validationResult && !validationResult.isValid) {
      // Set field-specific errors
      validationResult.errors.forEach(error => {
        setFieldError(error.field, error.message);
      });
      
      errorHandler.setError(new BudgetError(
        'Please correct the validation errors',
        BudgetErrorType.VALIDATION_ERROR,
        'VALIDATION_FAILED',
        validationResult,
        validationResult.errors
      ));
      
      return false;
    }
    
    // Execute submit operation
    const result = await errorHandler.executeWithErrorHandling(
      submitOperation,
      'form_submit'
    );
    
    return result.success;
  }, [errorHandler, clearAllFieldErrors, setFieldError]);

  return {
    ...errorHandler,
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllFieldErrors,
    getFieldError,
    hasFieldError,
    handleFormSubmit
  };
};
