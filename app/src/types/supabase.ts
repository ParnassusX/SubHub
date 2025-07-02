export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          subscription_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          subscription_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          subscription_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          renewal_reminder_enabled: boolean | null
          renewal_reminder_days: number[] | null
          spending_threshold_enabled: boolean | null
          spending_threshold_amount: number | null
          spending_threshold_percentage: number | null
          unused_subscription_enabled: boolean | null
          unused_subscription_days: number | null
          price_change_enabled: boolean | null
          email_notifications_enabled: boolean | null
          push_notifications_enabled: boolean | null
          in_app_notifications_enabled: boolean | null
          quiet_hours_enabled: boolean | null
          quiet_hours_start: string | null
          quiet_hours_end: string | null
          max_daily_notifications: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          renewal_reminder_enabled?: boolean | null
          renewal_reminder_days?: number[] | null
          spending_threshold_enabled?: boolean | null
          spending_threshold_amount?: number | null
          spending_threshold_percentage?: number | null
          unused_subscription_enabled?: boolean | null
          unused_subscription_days?: number | null
          price_change_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          push_notifications_enabled?: boolean | null
          in_app_notifications_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          max_daily_notifications?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          renewal_reminder_enabled?: boolean | null
          renewal_reminder_days?: number[] | null
          spending_threshold_enabled?: boolean | null
          spending_threshold_amount?: number | null
          spending_threshold_percentage?: number | null
          unused_subscription_enabled?: boolean | null
          unused_subscription_days?: number | null
          price_change_enabled?: boolean | null
          email_notifications_enabled?: boolean | null
          push_notifications_enabled?: boolean | null
          in_app_notifications_enabled?: boolean | null
          quiet_hours_enabled?: boolean | null
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          max_daily_notifications?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
          timezone: string | null
          currency: string | null
          date_format: string | null
          monthly_budget: number | null
          yearly_budget: number | null
          category_budgets: Json
          budget_alerts_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
          timezone?: string | null
          currency?: string | null
          date_format?: string | null
          monthly_budget?: number | null
          yearly_budget?: number | null
          category_budgets?: Json
          budget_alerts_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
          timezone?: string | null
          currency?: string | null
          date_format?: string | null
          monthly_budget?: number | null
          yearly_budget?: number | null
          category_budgets?: Json
          budget_alerts_enabled?: boolean | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          category: string
          cost: number
          created_at: string | null
          description: string | null
          frequency: string
          id: string
          name: string
          start_date: string
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          category: string
          cost: number
          created_at?: string | null
          description?: string | null
          frequency: string
          id?: string
          name: string
          start_date: string
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          category?: string
          cost?: number
          created_at?: string | null
          description?: string | null
          frequency?: string
          id?: string
          name?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          email_notifications: boolean
          push_notifications: boolean
          renewal_alerts: boolean
          spending_alerts: boolean
          weekly_summary: boolean
          monthly_report: boolean
          reminder_frequency: string
          theme: string
          language: string
          auto_categorize: boolean
          data_export_format: string
          onboarding_completed: boolean
          onboarding_started_at: string | null
          onboarding_completed_at: string | null
          current_step: string | null
          completed_steps: string[]
          skipped_steps: string[]
          has_seen_premium_features: boolean
          conversion_opportunities_shown: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_notifications?: boolean
          push_notifications?: boolean
          renewal_alerts?: boolean
          spending_alerts?: boolean
          weekly_summary?: boolean
          monthly_report?: boolean
          reminder_frequency?: string
          theme?: string
          language?: string
          auto_categorize?: boolean
          data_export_format?: string
          onboarding_completed?: boolean
          onboarding_started_at?: string | null
          onboarding_completed_at?: string | null
          current_step?: string | null
          completed_steps?: string[]
          skipped_steps?: string[]
          has_seen_premium_features?: boolean
          conversion_opportunities_shown?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_notifications?: boolean
          push_notifications?: boolean
          renewal_alerts?: boolean
          spending_alerts?: boolean
          weekly_summary?: boolean
          monthly_report?: boolean
          reminder_frequency?: string
          theme?: string
          language?: string
          auto_categorize?: boolean
          data_export_format?: string
          onboarding_completed?: boolean
          onboarding_started_at?: string | null
          onboarding_completed_at?: string | null
          current_step?: string | null
          completed_steps?: string[]
          skipped_steps?: string[]
          has_seen_premium_features?: boolean
          conversion_opportunities_shown?: string[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_analytics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_users: number
          total_subscriptions: number
          total_annual_revenue: number
          active_users: number
          new_users_this_month: number
        }[]
      }
      get_category_breakdown: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          count: number
          total_cost: number
        }[]
      }
      get_user_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_subscriptions: number
          monthly_spending: number
          yearly_spending: number
          upcoming_renewals: number
          notifications_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// Helper types for our application
export type Profile = Tables<'profiles'>
export type Subscription = Tables<'subscriptions'>
export type Category = Tables<'categories'>
export type Notification = Tables<'notifications'>

export type SubscriptionInsert = TablesInsert<'subscriptions'>
export type SubscriptionUpdate = TablesUpdate<'subscriptions'>
export type CategoryInsert = TablesInsert<'categories'>
export type NotificationInsert = TablesInsert<'notifications'>

// Budget-specific types
export type ProfileUpdate = TablesUpdate<'profiles'>

// Budget data interfaces
export interface CategoryBudget {
  [categoryName: string]: number
}

export interface BudgetData {
  monthlyBudget?: number | null
  yearlyBudget?: number | null
  categoryBudgets?: CategoryBudget
  budgetAlertsEnabled?: boolean
}

export interface BudgetProgress {
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentageUsed: number
  status: 'under_budget' | 'approaching_limit' | 'over_budget'
}

export interface CategoryBudgetProgress extends BudgetProgress {
  categoryName: string
  categoryColor?: string
}

export interface BudgetInsight {
  type: 'budget_exceeded' | 'budget_warning' | 'budget_healthy' | 'no_budget_set'
  message: string
  recommendation?: string
  severity: 'low' | 'medium' | 'high'
  affectedCategories?: string[]
}

export interface BudgetAlert {
  id: string
  type: 'monthly_threshold' | 'yearly_threshold' | 'category_threshold'
  threshold: number
  currentAmount: number
  budgetAmount: number
  category?: string
  message: string
  createdAt: string
}

// Budget validation types
export interface BudgetValidationError {
  field: string
  message: string
  code: 'REQUIRED' | 'INVALID_AMOUNT' | 'NEGATIVE_VALUE' | 'EXCEEDS_LIMIT' | 'INVALID_CATEGORY' | 'TOO_MANY_CATEGORIES' | 'DUPLICATE_CATEGORY'
}

export interface BudgetValidationResult {
  isValid: boolean
  errors: BudgetValidationError[]
}

// Budget calculation types
export interface BudgetCalculationInput {
  subscriptions: Subscription[]
  monthlyBudget?: number | null
  yearlyBudget?: number | null
  categoryBudgets?: CategoryBudget
}

export interface BudgetSummary {
  totalMonthlySpending: number
  totalYearlySpending: number
  monthlyBudgetProgress?: BudgetProgress | null
  yearlyBudgetProgress?: BudgetProgress | null
  categoryBudgetProgress: CategoryBudgetProgress[]
  overallStatus: 'healthy' | 'warning' | 'exceeded'
  insights: BudgetInsight[]
  alerts: BudgetAlert[]
}

// Budget settings form types
export interface BudgetFormData {
  monthlyBudget: string
  yearlyBudget: string
  categoryBudgets: { [category: string]: string }
  budgetAlertsEnabled: boolean
}

// Budget threshold types
export type BudgetThreshold = 50 | 75 | 90 | 100 // Percentage thresholds for alerts

export interface BudgetThresholdConfig {
  warning: BudgetThreshold
  critical: BudgetThreshold
}
