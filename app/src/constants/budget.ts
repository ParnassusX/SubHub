// Budget Management Constants for SubHub
// Centralized constants for budget functionality

// Budget threshold percentages
export const BUDGET_THRESHOLDS = {
  WARNING: 75,    // Show warning at 75% of budget
  CRITICAL: 90,   // Show critical alert at 90% of budget
  EXCEEDED: 100   // Budget exceeded at 100%
} as const

// Budget alert types
export const BUDGET_ALERT_TYPES = {
  MONTHLY_THRESHOLD: 'monthly_threshold',
  YEARLY_THRESHOLD: 'yearly_threshold',
  CATEGORY_THRESHOLD: 'category_threshold'
} as const

// Budget status types
export const BUDGET_STATUS = {
  UNDER_BUDGET: 'under_budget',
  APPROACHING_LIMIT: 'approaching_limit',
  OVER_BUDGET: 'over_budget'
} as const

// Budget insight types
export const BUDGET_INSIGHT_TYPES = {
  BUDGET_EXCEEDED: 'budget_exceeded',
  BUDGET_WARNING: 'budget_warning',
  BUDGET_HEALTHY: 'budget_healthy',
  NO_BUDGET_SET: 'no_budget_set'
} as const

// Alert severity levels
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const

// Default budget values
export const DEFAULT_BUDGET_VALUES = {
  MONTHLY_BUDGET: null,
  YEARLY_BUDGET: null,
  CATEGORY_BUDGETS: {},
  BUDGET_ALERTS_ENABLED: true
} as const

// Budget validation limits
export const BUDGET_LIMITS = {
  MIN_BUDGET: 0,
  MAX_BUDGET: 999999.99,
  MAX_CATEGORY_BUDGETS: 50
} as const

// Budget calculation periods
export const BUDGET_PERIODS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
} as const

// Budget progress bar colors
export const BUDGET_COLORS = {
  HEALTHY: 'green',
  WARNING: 'yellow',
  CRITICAL: 'red',
  EXCEEDED: 'red',
  DEFAULT: 'blue'
} as const

// Budget form validation messages
export const BUDGET_VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_AMOUNT: 'Please enter a valid amount',
  NEGATIVE_VALUE: 'Budget amount cannot be negative',
  EXCEEDS_LIMIT: 'Budget amount exceeds maximum limit',
  INVALID_CATEGORY: 'Invalid category name'
} as const

// Budget insight messages
export const BUDGET_INSIGHT_MESSAGES = {
  HEALTHY: 'Your spending is well within budget',
  WARNING: 'You\'re approaching your budget limit',
  EXCEEDED: 'You\'ve exceeded your budget',
  NO_BUDGET: 'Set a budget to track your spending',
  CATEGORY_EXCEEDED: 'Category budget exceeded',
  CATEGORY_WARNING: 'Category budget approaching limit'
} as const

// Budget recommendation messages
export const BUDGET_RECOMMENDATIONS = {
  REDUCE_SPENDING: 'Consider reducing spending in high-cost categories',
  INCREASE_BUDGET: 'Consider increasing your budget to match spending patterns',
  CANCEL_SUBSCRIPTIONS: 'Review and cancel unused subscriptions',
  SET_CATEGORY_BUDGETS: 'Set category-specific budgets for better control',
  ENABLE_ALERTS: 'Enable budget alerts to stay informed'
} as const

// Budget calculation defaults
export const CALCULATION_DEFAULTS = {
  DAYS_IN_MONTH: 30,
  DAYS_IN_YEAR: 365,
  MONTHS_IN_YEAR: 12
} as const
