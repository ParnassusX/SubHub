/**
 * Bank Connection Service - Plaid Integration
 * Enables automatic subscription detection from bank transactions
 */

import { supabase } from '../lib/supabase';

// Plaid configuration from environment variables
const PLAID_CLIENT_ID = import.meta.env.VITE_PLAID_CLIENT_ID;
const PLAID_SECRET = import.meta.env.VITE_PLAID_SECRET;
const PLAID_ENV = import.meta.env.VITE_PLAID_ENV || 'sandbox';

export interface BankAccount {
  id: string;
  user_id: string;
  institution_name: string;
  account_name: string;
  account_type: string;
  mask: string; // Last 4 digits
  current_balance: number;
  available_balance: number;
  currency: string;
  plaid_account_id: string;
  plaid_access_token: string;
  last_synced_at: Date;
  is_active: boolean;
  created_at: Date;
}

export interface BankTransaction {
  id: string;
  bank_account_id: string;
  amount: number;
  date: Date;
  name: string;
  merchant_name?: string;
  category: string[];
  pending: boolean;
  is_subscription_candidate: boolean;
  confidence_score?: number;
  plaid_transaction_id: string;
}

class BankConnectionService {
  /**
   * Initialize Plaid Link for bank connection
   * Returns link token for frontend integration
   */
  async createLinkToken(userId: string): Promise<{ link_token: string }> {
    if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
      console.warn('Plaid credentials not configured. Set VITE_PLAID_CLIENT_ID and VITE_PLAID_SECRET');
      throw new Error('Bank integration not configured');
    }

    try {
      // In production, this would call Plaid API from backend
      // For now, return a placeholder that will trigger setup guide
      return {
        link_token: 'link-sandbox-placeholder'
      };
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw error;
    }
  }

  /**
   * Exchange public token for access token after successful bank connection
   */
  async exchangePublicToken(publicToken: string, userId: string): Promise<BankAccount> {
    try {
      // In production, this exchanges token with Plaid API
      // Then stores access_token securely in database
      
      // Mock implementation for development
      const mockAccount: BankAccount = {
        id: crypto.randomUUID(),
        user_id: userId,
        institution_name: 'Example Bank',
        account_name: 'Checking Account',
        account_type: 'depository',
        mask: '0000',
        current_balance: 0,
        available_balance: 0,
        currency: 'USD',
        plaid_account_id: 'acc_placeholder',
        plaid_access_token: 'access_placeholder',
        last_synced_at: new Date(),
        is_active: true,
        created_at: new Date()
      };

      // Store in database
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert(mockAccount)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error exchanging public token:', error);
      throw error;
    }
  }

  /**
   * Get all connected bank accounts for user
   */
  async getConnectedAccounts(userId: string): Promise<BankAccount[]> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      return [];
    }
  }

  /**
   * Sync transactions from connected bank accounts
   * Runs automatically or on-demand
   */
  async syncTransactions(bankAccountId: string): Promise<{
    transactions: BankTransaction[];
    subscriptionCandidates: number;
  }> {
    try {
      // In production, this fetches transactions from Plaid API
      // Then analyzes them for subscription patterns
      
      // Mock implementation
      const mockTransactions: BankTransaction[] = [];
      let subscriptionCandidates = 0;

      // Store transactions in database
      if (mockTransactions.length > 0) {
        const { error } = await supabase
          .from('bank_transactions')
          .upsert(mockTransactions, { 
            onConflict: 'plaid_transaction_id' 
          });

        if (error) throw error;
      }

      // Update last sync time
      await supabase
        .from('bank_accounts')
        .update({ last_synced_at: new Date() })
        .eq('id', bankAccountId);

      return {
        transactions: mockTransactions,
        subscriptionCandidates
      };
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }

  /**
   * Disconnect bank account
   */
  async disconnectAccount(bankAccountId: string): Promise<void> {
    try {
      await supabase
        .from('bank_accounts')
        .update({ is_active: false })
        .eq('id', bankAccountId);
    } catch (error) {
      console.error('Error disconnecting bank account:', error);
      throw error;
    }
  }

  /**
   * Get balance summary across all accounts
   */
  async getBalanceSummary(userId: string): Promise<{
    total_balance: number;
    total_available: number;
    accounts_count: number;
  }> {
    try {
      const accounts = await this.getConnectedAccounts(userId);
      
      const summary = accounts.reduce((acc, account) => ({
        total_balance: acc.total_balance + account.current_balance,
        total_available: acc.total_available + account.available_balance,
        accounts_count: acc.accounts_count + 1
      }), {
        total_balance: 0,
        total_available: 0,
        accounts_count: 0
      });

      return summary;
    } catch (error) {
      console.error('Error getting balance summary:', error);
      return {
        total_balance: 0,
        total_available: 0,
        accounts_count: 0
      };
    }
  }

  /**
   * Check if user has any connected bank accounts
   */
  async hasConnectedAccounts(userId: string): Promise<boolean> {
    const accounts = await this.getConnectedAccounts(userId);
    return accounts.length > 0;
  }

  /**
   * Setup guide for bank integration
   */
  getSetupInstructions(): {
    title: string;
    steps: string[];
    apiKeyUrl: string;
    documentation: string;
  } {
    return {
      title: 'Setup Bank Integration',
      steps: [
        '1. Sign up for Plaid at https://plaid.com/pricing/ (Free tier: 100 items/month)',
        '2. Create a new application in Plaid Dashboard',
        '3. Get your Client ID and Secret',
        '4. Add to .env.local: VITE_PLAID_CLIENT_ID=xxx, VITE_PLAID_SECRET=xxx',
        '5. Set VITE_PLAID_ENV=sandbox for testing (or development/production)',
        '6. Restart the app and connect your bank!'
      ],
      apiKeyUrl: 'https://dashboard.plaid.com/team/keys',
      documentation: 'https://plaid.com/docs/quickstart/'
    };
  }

  /**
   * Check if Plaid is configured
   */
  isConfigured(): boolean {
    return !!(PLAID_CLIENT_ID && PLAID_SECRET);
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus(): {
    configured: boolean;
    environment: string;
    message: string;
  } {
    const configured = this.isConfigured();
    return {
      configured,
      environment: PLAID_ENV,
      message: configured 
        ? `Bank integration ready (${PLAID_ENV} mode)`
        : 'Bank integration not configured. Add Plaid API credentials to enable.'
    };
  }
}

export const bankConnectionService = new BankConnectionService();
