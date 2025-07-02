// Budget Alerts Hook - React hook for managing budget alerts
import { useState, useEffect, useCallback } from 'react';
import { useSubscriptions } from '../contexts/SubscriptionContext';
import { useBudget } from './useBudget';
import { BudgetAlertService, BudgetAlert, AlertSettings } from '../services/budgetAlertService';

export const useBudgetAlerts = () => {
  const { subscriptions } = useSubscriptions();
  const { monthlyBudget, yearlyBudget, categoryBudgets } = useBudget();
  
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>(
    BudgetAlertService.getAlertSettings()
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load alerts from storage
  const loadAlerts = useCallback(() => {
    setIsLoading(true);
    try {
      const storedAlerts = BudgetAlertService.getStoredAlerts();
      setAlerts(storedAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate new alerts based on current data
  const generateAlerts = useCallback(() => {
    if (!subscriptions.length) return;

    try {
      const newAlerts = BudgetAlertService.generateAlerts(
        subscriptions,
        monthlyBudget || undefined,
        yearlyBudget || undefined,
        categoryBudgets,
        alertSettings
      );
      
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  }, [subscriptions, monthlyBudget, yearlyBudget, categoryBudgets, alertSettings]);

  // Acknowledge an alert
  const acknowledgeAlert = useCallback((alertId: string) => {
    try {
      BudgetAlertService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    try {
      BudgetAlertService.clearAllAlerts();
      setAlerts([]);
    } catch (error) {
      console.error('Error clearing alerts:', error);
    }
  }, []);

  // Update alert settings
  const updateAlertSettings = useCallback((newSettings: Partial<AlertSettings>) => {
    try {
      BudgetAlertService.saveAlertSettings(newSettings);
      const updatedSettings = BudgetAlertService.getAlertSettings();
      setAlertSettings(updatedSettings);
      
      // Regenerate alerts with new settings
      generateAlerts();
    } catch (error) {
      console.error('Error updating alert settings:', error);
    }
  }, [generateAlerts]);

  // Load alerts on mount
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Generate alerts when dependencies change
  useEffect(() => {
    if (!isLoading && alertSettings.enabled) {
      generateAlerts();
    }
  }, [generateAlerts, isLoading, alertSettings.enabled]);

  // Computed values
  const activeAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = activeAlerts.filter(alert => 
    alert.severity === 'critical' || alert.actionRequired
  );
  const warningAlerts = activeAlerts.filter(alert => alert.severity === 'warning');
  
  const alertCounts = {
    total: activeAlerts.length,
    critical: criticalAlerts.length,
    warning: warningAlerts.length
  };

  const hasActiveAlerts = activeAlerts.length > 0;
  const hasCriticalAlerts = criticalAlerts.length > 0;

  // Get alerts by type
  const getAlertsByType = useCallback((type: 'monthly' | 'yearly' | 'category') => {
    return activeAlerts.filter(alert => alert.type === type);
  }, [activeAlerts]);

  // Get alerts by category
  const getAlertsByCategory = useCallback((category: string) => {
    return activeAlerts.filter(alert => alert.category === category);
  }, [activeAlerts]);

  return {
    // Alert data
    alerts,
    activeAlerts,
    criticalAlerts,
    warningAlerts,
    alertCounts,
    
    // Alert settings
    alertSettings,
    updateAlertSettings,
    
    // State
    isLoading,
    hasActiveAlerts,
    hasCriticalAlerts,
    
    // Actions
    acknowledgeAlert,
    clearAllAlerts,
    generateAlerts,
    loadAlerts,
    
    // Utilities
    getAlertsByType,
    getAlertsByCategory
  };
};
