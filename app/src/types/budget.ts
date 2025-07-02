// Budget Management Types for SubHub
// Comprehensive type definitions for budget functionality

import {
  CategoryBudget,
  BudgetProgress,
  BudgetInsight,
  BudgetAlert,
  BudgetData,
  BudgetSummary,
  CategoryBudgetProgress,
  BudgetCalculationInput,
  BudgetThresholdConfig,
  BudgetFormData,
  BudgetValidationResult
} from './supabase'
// import { Subscription } from '../contexts/SubscriptionContext' // Unused import

// Budget status enums
export type BudgetStatus = 'under_budget' | 'approaching_limit' | 'over_budget'
export type BudgetPeriod = 'monthly' | 'yearly'
export type AlertSeverity = 'low' | 'medium' | 'high'

// Budget calculation constants
export const BUDGET_THRESHOLDS = {
  WARNING: 75,    // 75% of budget used
  CRITICAL: 90,   // 90% of budget used
  EXCEEDED: 100   // 100% or more of budget used
} as const

export const BUDGET_ALERT_TYPES = {
  MONTHLY_THRESHOLD: 'monthly_threshold',
  YEARLY_THRESHOLD: 'yearly_threshold',
  CATEGORY_THRESHOLD: 'category_threshold'
} as const

// Budget calculation utilities
export interface BudgetCalculationOptions {
  includeInactive?: boolean
  startDate?: Date
  endDate?: Date
  currency?: string
}

export interface BudgetMetrics {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  percentageUsed: number
  daysInPeriod: number
  daysRemaining: number
  averageDailySpending: number
  projectedMonthlySpending: number
}

// Budget component props
export interface BudgetOverviewProps {
  monthlyBudget?: number | null
  yearlyBudget?: number | null
  monthlySpending: number
  yearlySpending: number
  currency: string
  onEditBudget?: () => void
}

export interface BudgetProgressBarProps {
  current: number
  budget: number
  label: string
  currency: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'yellow' | 'red' | 'blue'
}

export interface CategoryBudgetEditorProps {
  categories: string[]
  categoryBudgets: CategoryBudget
  onBudgetChange: (category: string, amount: number | null) => void
  currency: string
  disabled?: boolean
}

// Budget hook return types
export interface UseBudgetReturn {
  // Budget data
  monthlyBudget: number | null
  yearlyBudget: number | null
  categoryBudgets: CategoryBudget
  budgetAlertsEnabled: boolean
  
  // Calculated values
  monthlySpending: number
  yearlySpending: number
  budgetSummary: BudgetSummary | null
  
  // Progress tracking
  monthlyProgress: BudgetProgress | null
  yearlyProgress: BudgetProgress | null
  categoryProgress: CategoryBudgetProgress[]
  
  // Insights and alerts
  insights: BudgetInsight[]
  alerts: BudgetAlert[]
  
  // Actions
  updateBudget: (budgetData: Partial<BudgetData>) => Promise<boolean>
  resetBudget: () => Promise<boolean>
  
  // State
  isLoading: boolean
  error: string | null
}

// Budget service types
export interface BudgetServiceMethods {
  getBudgetData: (userId: string) => Promise<BudgetData | null>
  updateBudgetData: (userId: string, budgetData: Partial<BudgetData>) => Promise<boolean>
  calculateBudgetProgress: (input: BudgetCalculationInput) => BudgetSummary
  generateBudgetInsights: (summary: BudgetSummary) => BudgetInsight[]
  checkBudgetAlerts: (summary: BudgetSummary, thresholds: BudgetThresholdConfig) => BudgetAlert[]
  validateBudgetData: (budgetData: BudgetFormData) => BudgetValidationResult
}

// Re-export commonly used types from supabase
export type {
  CategoryBudget,
  BudgetData,
  BudgetProgress,
  CategoryBudgetProgress,
  BudgetInsight,
  BudgetAlert,
  BudgetValidationError,
  BudgetValidationResult,
  BudgetCalculationInput,
  BudgetSummary,
  BudgetFormData,
  BudgetThreshold,
  BudgetThresholdConfig
} from './supabase'
