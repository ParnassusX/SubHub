// Budget Error Handling Utilities
import { BudgetValidationError } from '../types/budget';

// Error types for budget operations
export enum BudgetErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Budget error class
export class BudgetError extends Error {
  public type: BudgetErrorType;
  public code?: string;
  public details?: any;
  public validationErrors?: BudgetValidationError[];

  constructor(
    message: string,
    type: BudgetErrorType = BudgetErrorType.UNKNOWN_ERROR,
    code?: string,
    details?: any,
    validationErrors?: BudgetValidationError[]
  ) {
    super(message);
    this.name = 'BudgetError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.validationErrors = validationErrors;
  }
}

// Error message mappings
export const ERROR_MESSAGES = {
  // Validation errors
  VALIDATION_FAILED: 'Please correct the validation errors and try again',
  INVALID_BUDGET_AMOUNT: 'Budget amount must be a valid positive number',
  BUDGET_TOO_HIGH: 'Budget amount exceeds the maximum allowed limit',
  CATEGORY_LIMIT_EXCEEDED: 'Too many category budgets. Maximum allowed is 50',
  
  // Network errors
  NETWORK_UNAVAILABLE: 'Network connection is unavailable. Please check your internet connection',
  REQUEST_TIMEOUT: 'Request timed out. Please try again',
  
  // Permission errors
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  
  // Server errors
  SERVER_UNAVAILABLE: 'Server is temporarily unavailable. Please try again later',
  DATABASE_ERROR: 'Database error occurred. Please try again',
  
  // Generic errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again',
  BUDGET_UPDATE_FAILED: 'Failed to update budget settings',
  BUDGET_LOAD_FAILED: 'Failed to load budget data'
} as const;

// Error handler function
export function handleBudgetError(error: any): BudgetError {
  // If it's already a BudgetError, return as is
  if (error instanceof BudgetError) {
    return error;
  }

  // Handle Supabase/PostgreSQL errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return new BudgetError(
          'Budget data not found',
          BudgetErrorType.SERVER_ERROR,
          'NOT_FOUND'
        );
      
      case '23514': // Check constraint violation
        return new BudgetError(
          ERROR_MESSAGES.INVALID_BUDGET_AMOUNT,
          BudgetErrorType.VALIDATION_ERROR,
          'CONSTRAINT_VIOLATION'
        );
      
      case '42501': // Insufficient privilege
        return new BudgetError(
          ERROR_MESSAGES.UNAUTHORIZED,
          BudgetErrorType.PERMISSION_ERROR,
          'INSUFFICIENT_PRIVILEGE'
        );
      
      default:
        return new BudgetError(
          ERROR_MESSAGES.DATABASE_ERROR,
          BudgetErrorType.SERVER_ERROR,
          error.code
        );
    }
  }

  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
    return new BudgetError(
      ERROR_MESSAGES.NETWORK_UNAVAILABLE,
      BudgetErrorType.NETWORK_ERROR,
      'NETWORK_ERROR'
    );
  }

  // Handle timeout errors
  if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    return new BudgetError(
      ERROR_MESSAGES.REQUEST_TIMEOUT,
      BudgetErrorType.NETWORK_ERROR,
      'TIMEOUT'
    );
  }

  // Handle validation errors
  if (error?.validationErrors) {
    return new BudgetError(
      ERROR_MESSAGES.VALIDATION_FAILED,
      BudgetErrorType.VALIDATION_ERROR,
      'VALIDATION_FAILED',
      error,
      error.validationErrors
    );
  }

  // Default error handling
  return new BudgetError(
    error?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    BudgetErrorType.UNKNOWN_ERROR,
    'UNKNOWN',
    error
  );
}

// Error recovery suggestions
export function getErrorRecoverySuggestion(error: BudgetError): string {
  switch (error.type) {
    case BudgetErrorType.VALIDATION_ERROR:
      return 'Please review and correct the highlighted fields, then try again.';
    
    case BudgetErrorType.NETWORK_ERROR:
      return 'Please check your internet connection and try again.';
    
    case BudgetErrorType.PERMISSION_ERROR:
      return 'Please log out and log back in, then try again.';
    
    case BudgetErrorType.SERVER_ERROR:
      return 'Please wait a moment and try again. If the problem persists, contact support.';
    
    default:
      return 'Please try again. If the problem persists, refresh the page or contact support.';
  }
}

// Check if error is retryable
export function isRetryableError(error: BudgetError): boolean {
  switch (error.type) {
    case BudgetErrorType.NETWORK_ERROR:
    case BudgetErrorType.SERVER_ERROR:
      return true;
    
    case BudgetErrorType.VALIDATION_ERROR:
    case BudgetErrorType.PERMISSION_ERROR:
      return false;
    
    default:
      return true;
  }
}

// Format error for user display
export function formatErrorForUser(error: BudgetError): {
  title: string;
  message: string;
  suggestion: string;
  canRetry: boolean;
} {
  let title = 'Error';
  
  switch (error.type) {
    case BudgetErrorType.VALIDATION_ERROR:
      title = 'Validation Error';
      break;
    case BudgetErrorType.NETWORK_ERROR:
      title = 'Connection Error';
      break;
    case BudgetErrorType.PERMISSION_ERROR:
      title = 'Permission Error';
      break;
    case BudgetErrorType.SERVER_ERROR:
      title = 'Server Error';
      break;
    default:
      title = 'Unexpected Error';
  }

  return {
    title,
    message: error.message,
    suggestion: getErrorRecoverySuggestion(error),
    canRetry: isRetryableError(error)
  };
}

// Log error for debugging
export function logBudgetError(error: BudgetError, context?: string): void {
  const logData = {
    type: error.type,
    message: error.message,
    code: error.code,
    context,
    timestamp: new Date().toISOString(),
    details: error.details,
    validationErrors: error.validationErrors
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Budget Error:', logData);
  }

  // In production, you might want to send this to an error tracking service
  // Example: Sentry.captureException(error, { extra: logData });
}

// Retry mechanism for budget operations
export async function retryBudgetOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: BudgetError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = handleBudgetError(error);
      
      // Don't retry if error is not retryable
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

// Safe budget operation wrapper
export async function safeBudgetOperation<T>(
  operation: () => Promise<T>,
  context: string,
  onError?: (error: BudgetError) => void
): Promise<{ success: true; data: T } | { success: false; error: BudgetError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const budgetError = handleBudgetError(error);
    logBudgetError(budgetError, context);
    
    if (onError) {
      onError(budgetError);
    }
    
    return { success: false, error: budgetError };
  }
}

// Validation error aggregator
export function aggregateValidationErrors(errors: BudgetValidationError[]): {
  fieldErrors: Record<string, string[]>;
  generalErrors: string[];
} {
  const fieldErrors: Record<string, string[]> = {};
  const generalErrors: string[] = [];

  errors.forEach(error => {
    if (error.field && error.field !== 'general') {
      if (!fieldErrors[error.field]) {
        fieldErrors[error.field] = [];
      }
      fieldErrors[error.field].push(error.message);
    } else {
      generalErrors.push(error.message);
    }
  });

  return { fieldErrors, generalErrors };
}
