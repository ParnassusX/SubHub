import { useCallback, useEffect } from 'react';

interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
}

export const useErrorHandler = () => {
  // Global error handler for unhandled promise rejections
  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    const errorDetails: ErrorDetails = {
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    logError(errorDetails);
    
    // Prevent the default browser behavior
    event.preventDefault();
  }, []);

  // Global error handler for JavaScript errors
  const handleError = useCallback((event: ErrorEvent) => {
    console.error('Global error:', event.error);
    
    const errorDetails: ErrorDetails = {
      message: event.message,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    logError(errorDetails);
  }, []);

  // Log error to external service
  const logError = useCallback((errorDetails: ErrorDetails) => {
    try {
      // In production, send to error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to error tracking service
        // fetch('/api/errors', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(errorDetails)
        // });
      }

      // Store in localStorage for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        const errors = JSON.parse(localStorage.getItem('subhub_errors') || '[]');
        errors.push(errorDetails);
        
        // Keep only last 10 errors
        if (errors.length > 10) {
          errors.splice(0, errors.length - 10);
        }
        
        localStorage.setItem('subhub_errors', JSON.stringify(errors));
      }
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }, []);

  // Handle Supabase errors specifically
  const handleSupabaseError = useCallback((error: any, context: string) => {
    console.error(`Supabase error in ${context}:`, error);
    
    const errorDetails: ErrorDetails = {
      message: `Supabase Error (${context}): ${error.message || error}`,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    logError(errorDetails);

    // Return user-friendly error message
    if (error.code === 'PGRST301') {
      return 'Database connection error. Please try again.';
    } else if (error.code === 'PGRST116') {
      return 'No data found.';
    } else if (error.message?.includes('JWT')) {
      return 'Session expired. Please log in again.';
    } else if (error.message?.includes('permission')) {
      return 'You do not have permission to perform this action.';
    } else {
      return 'An unexpected error occurred. Please try again.';
    }
  }, [logError]);

  // Handle network errors
  const handleNetworkError = useCallback((error: any, context: string) => {
    console.error(`Network error in ${context}:`, error);
    
    const errorDetails: ErrorDetails = {
      message: `Network Error (${context}): ${error.message || 'Network request failed'}`,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    logError(errorDetails);

    // Return user-friendly error message
    if (!navigator.onLine) {
      return 'You appear to be offline. Please check your internet connection.';
    } else {
      return 'Network error. Please check your connection and try again.';
    }
  }, [logError]);

  // Handle form validation errors
  const handleValidationError = useCallback((errors: Record<string, string>, context: string) => {
    console.warn(`Validation errors in ${context}:`, errors);
    
    const errorDetails: ErrorDetails = {
      message: `Validation Error (${context}): ${JSON.stringify(errors)}`,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    logError(errorDetails);

    return errors;
  }, [logError]);

  // Setup global error handlers
  useEffect(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError, handleUnhandledRejection]);

  // Get stored errors (for debugging)
  const getStoredErrors = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('subhub_errors') || '[]');
    } catch {
      return [];
    }
  }, []);

  // Clear stored errors
  const clearStoredErrors = useCallback(() => {
    localStorage.removeItem('subhub_errors');
  }, []);

  return {
    handleSupabaseError,
    handleNetworkError,
    handleValidationError,
    logError,
    getStoredErrors,
    clearStoredErrors,
  };
};

// Hook for component-level error handling
export const useComponentErrorHandler = (componentName: string) => {
  const { logError } = useErrorHandler();

  const handleComponentError = useCallback((error: Error, context?: string) => {
    const errorDetails: ErrorDetails = {
      message: `Component Error (${componentName}${context ? ` - ${context}` : ''}): ${error.message}`,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    logError(errorDetails);
  }, [componentName, logError]);

  return { handleComponentError };
};

// Hook for async operation error handling
export const useAsyncErrorHandler = () => {
  const { handleSupabaseError, handleNetworkError } = useErrorHandler();

  const handleAsyncError = useCallback(async <T>(
    operation: () => Promise<T>,
    context: string,
    fallbackValue?: T
  ): Promise<T | undefined> => {
    try {
      return await operation();
    } catch (error: any) {
      // Determine error type and handle accordingly
      if (error.code || error.message?.includes('supabase')) {
        handleSupabaseError(error, context);
      } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        handleNetworkError(error, context);
      } else {
        console.error(`Async error in ${context}:`, error);
      }

      return fallbackValue;
    }
  }, [handleSupabaseError, handleNetworkError]);

  return { handleAsyncError };
};
