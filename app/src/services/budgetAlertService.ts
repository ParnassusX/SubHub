// Budget Alert Service - Handles budget threshold alerts and notifications
import { Subscription } from '../contexts/SubscriptionContext';
import { BudgetService } from './budgetService';
import { BUDGET_THRESHOLDS } from '../constants/budget';

export interface BudgetAlert {
  id: string;
  type: 'monthly' | 'yearly' | 'category';
  category?: string;
  severity: 'warning' | 'critical';
  threshold: number;
  currentAmount: number;
  budgetAmount: number;
  percentageUsed: number;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
}

export interface AlertSettings {
  enabled: boolean;
  warningThreshold: number; // Percentage (e.g., 75)
  criticalThreshold: number; // Percentage (e.g., 90)
  monthlyAlertsEnabled: boolean;
  yearlyAlertsEnabled: boolean;
  categoryAlertsEnabled: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
}

export class BudgetAlertService {
  private static readonly STORAGE_KEY = 'budget_alerts';
  private static readonly SETTINGS_KEY = 'budget_alert_settings';

  // Default alert settings
  private static readonly DEFAULT_SETTINGS: AlertSettings = {
    enabled: true,
    warningThreshold: BUDGET_THRESHOLDS.WARNING,
    criticalThreshold: BUDGET_THRESHOLDS.CRITICAL,
    monthlyAlertsEnabled: true,
    yearlyAlertsEnabled: true,
    categoryAlertsEnabled: true,
    emailNotifications: false,
    inAppNotifications: true
  };

  /**
   * Generate budget alerts based on current spending and budgets
   */
  static generateAlerts(
    subscriptions: Subscription[],
    monthlyBudget?: number,
    yearlyBudget?: number,
    categoryBudgets?: Record<string, number>,
    settings?: AlertSettings
  ): BudgetAlert[] {
    const alertSettings = settings || this.getAlertSettings();
    
    if (!alertSettings.enabled) {
      return [];
    }

    const alerts: BudgetAlert[] = [];

    // Calculate current spending
    const { monthly: monthlySpending } = BudgetService.calculateSpending(subscriptions);
    const yearlySpending = monthlySpending * 12;
    const categorySpending = BudgetService.calculateCategorySpending(subscriptions);

    // Monthly budget alerts
    if (alertSettings.monthlyAlertsEnabled && monthlyBudget && monthlyBudget > 0) {
      const progress = BudgetService.calculateBudgetProgress(monthlySpending, monthlyBudget);
      const alert = this.createBudgetAlert(
        'monthly',
        progress,
        alertSettings,
        'Monthly budget'
      );
      if (alert) alerts.push(alert);
    }

    // Yearly budget alerts
    if (alertSettings.yearlyAlertsEnabled && yearlyBudget && yearlyBudget > 0) {
      const progress = BudgetService.calculateBudgetProgress(yearlySpending, yearlyBudget);
      const alert = this.createBudgetAlert(
        'yearly',
        progress,
        alertSettings,
        'Yearly budget'
      );
      if (alert) alerts.push(alert);
    }

    // Category budget alerts
    if (alertSettings.categoryAlertsEnabled && categoryBudgets) {
      Object.entries(categoryBudgets).forEach(([category, budget]) => {
        if (budget > 0) {
          const spending = categorySpending[category] || 0;
          const progress = BudgetService.calculateBudgetProgress(spending, budget);
          const alert = this.createBudgetAlert(
            'category',
            progress,
            alertSettings,
            `${category} budget`,
            category
          );
          if (alert) alerts.push(alert);
        }
      });
    }

    // Store alerts
    this.storeAlerts(alerts);

    return alerts;
  }

  /**
   * Create a budget alert if thresholds are exceeded
   */
  private static createBudgetAlert(
    type: 'monthly' | 'yearly' | 'category',
    progress: ReturnType<typeof BudgetService.calculateBudgetProgress>,
    settings: AlertSettings,
    budgetName: string,
    category?: string
  ): BudgetAlert | null {
    const { percentageUsed, spentAmount, budgetAmount, status } = progress;

    // Determine if alert should be triggered
    let severity: 'warning' | 'critical' | null = null;
    
    if (percentageUsed >= settings.criticalThreshold || status === 'over_budget') {
      severity = 'critical';
    } else if (percentageUsed >= settings.warningThreshold) {
      severity = 'warning';
    }

    if (!severity) {
      return null;
    }

    // Generate alert message
    const message = this.generateAlertMessage(
      budgetName,
      percentageUsed,
      spentAmount,
      budgetAmount,
      severity,
      status === 'over_budget'
    );

    return {
      id: this.generateAlertId(type, category),
      type,
      category,
      severity,
      threshold: severity === 'critical' ? settings.criticalThreshold : settings.warningThreshold,
      currentAmount: spentAmount,
      budgetAmount,
      percentageUsed,
      message,
      timestamp: new Date(),
      acknowledged: false,
      actionRequired: severity === 'critical' || status === 'over_budget'
    };
  }

  /**
   * Generate alert message based on budget status
   */
  private static generateAlertMessage(
    budgetName: string,
    percentageUsed: number,
    spentAmount: number,
    budgetAmount: number,
    severity: 'warning' | 'critical',
    isOverBudget: boolean
  ): string {
    if (isOverBudget) {
      const overage = spentAmount - budgetAmount;
      return `${budgetName} exceeded by $${overage.toFixed(2)}`;
    }

    if (severity === 'critical') {
      return `${budgetName} is ${percentageUsed.toFixed(1)}% used - approaching limit`;
    }

    return `${budgetName} is ${percentageUsed.toFixed(1)}% used - monitor spending`;
  }

  /**
   * Generate unique alert ID
   */
  private static generateAlertId(type: string, category?: string): string {
    const timestamp = Date.now();
    const categoryPart = category ? `-${category.toLowerCase().replace(/\s+/g, '-')}` : '';
    return `${type}${categoryPart}-${timestamp}`;
  }

  /**
   * Get stored alerts
   */
  static getStoredAlerts(): BudgetAlert[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const alerts = JSON.parse(stored);
      return alerts.map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      }));
    } catch (error) {
      console.error('Error loading stored alerts:', error);
      return [];
    }
  }

  /**
   * Store alerts in localStorage
   */
  private static storeAlerts(alerts: BudgetAlert[]): void {
    try {
      // Merge with existing alerts, avoiding duplicates
      const existingAlerts = this.getStoredAlerts();
      const newAlerts = alerts.filter(alert => 
        !existingAlerts.some(existing => existing.id === alert.id)
      );
      
      const allAlerts = [...existingAlerts, ...newAlerts];
      
      // Keep only recent alerts (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAlerts = allAlerts.filter(alert => 
        alert.timestamp > thirtyDaysAgo
      );
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentAlerts));
    } catch (error) {
      console.error('Error storing alerts:', error);
    }
  }

  /**
   * Acknowledge an alert
   */
  static acknowledgeAlert(alertId: string): void {
    try {
      const alerts = this.getStoredAlerts();
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }

  /**
   * Clear all alerts
   */
  static clearAllAlerts(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  }

  /**
   * Get alert settings
   */
  static getAlertSettings(): AlertSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (!stored) return this.DEFAULT_SETTINGS;
      
      return { ...this.DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error loading alert settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  /**
   * Save alert settings
   */
  static saveAlertSettings(settings: Partial<AlertSettings>): void {
    try {
      const currentSettings = this.getAlertSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error saving alert settings:', error);
    }
  }

  /**
   * Get active (unacknowledged) alerts
   */
  static getActiveAlerts(): BudgetAlert[] {
    return this.getStoredAlerts().filter(alert => !alert.acknowledged);
  }

  /**
   * Get critical alerts that require immediate attention
   */
  static getCriticalAlerts(): BudgetAlert[] {
    return this.getActiveAlerts().filter(alert => 
      alert.severity === 'critical' || alert.actionRequired
    );
  }

  /**
   * Check if there are any active alerts
   */
  static hasActiveAlerts(): boolean {
    return this.getActiveAlerts().length > 0;
  }

  /**
   * Get alert count by severity
   */
  static getAlertCounts(): { warning: number; critical: number; total: number } {
    const activeAlerts = this.getActiveAlerts();
    const warning = activeAlerts.filter(alert => alert.severity === 'warning').length;
    const critical = activeAlerts.filter(alert => alert.severity === 'critical').length;
    
    return {
      warning,
      critical,
      total: activeAlerts.length
    };
  }
}
