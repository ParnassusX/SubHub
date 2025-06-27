import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../lib/supabase';
import { SubscriptionInsert, SubscriptionUpdate } from '../types/supabase';
import { useAuth } from './AuthContext';

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  frequency: 'Monthly' | 'Yearly';
  category: string;
  startDate: string;
  description?: string;
  website?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

interface SubscriptionContextType {
  subscriptions: Subscription[];
  addSubscription: (subscription: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSubscription: (id: string, subscription: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
  getSubscription: (id: string) => Subscription | undefined;
  isLoading: boolean;
  error: string | null;
  refreshSubscriptions: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscriptions = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load subscriptions when user changes
  useEffect(() => {
    if (user) {
      refreshSubscriptions();
    } else {
      setSubscriptions([]);
    }
  }, [user]);

  const refreshSubscriptions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await db.subscriptions.getAll();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Convert Supabase format to our format
      const formattedSubscriptions: Subscription[] = (data || []).map(sub => ({
        id: sub.id,
        name: sub.name,
        cost: sub.cost,
        frequency: sub.frequency as 'Monthly' | 'Yearly',
        category: sub.category,
        startDate: sub.start_date,
        description: sub.description || undefined,
        website: sub.website || undefined,
        user_id: sub.user_id,
        created_at: sub.created_at || undefined,
        updated_at: sub.updated_at || undefined,
      }));
      
      setSubscriptions(formattedSubscriptions);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const addSubscription = async (subscriptionData: Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const insertData: SubscriptionInsert = {
        user_id: user.id,
        name: subscriptionData.name,
        cost: subscriptionData.cost,
        frequency: subscriptionData.frequency,
        category: subscriptionData.category,
        start_date: subscriptionData.startDate,
        description: subscriptionData.description || null,
        website: subscriptionData.website || null,
      };

      const { data, error: insertError } = await db.subscriptions.create(insertData);
      
      if (insertError) {
        throw insertError;
      }

      if (data) {
        const newSubscription: Subscription = {
          id: data.id,
          name: data.name,
          cost: data.cost,
          frequency: data.frequency as 'Monthly' | 'Yearly',
          category: data.category,
          startDate: data.start_date,
          description: data.description || undefined,
          website: data.website || undefined,
          user_id: data.user_id,
          created_at: data.created_at || undefined,
          updated_at: data.updated_at || undefined,
        };

        setSubscriptions(prev => [...prev, newSubscription]);
      }
    } catch (err) {
      console.error('Error adding subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to add subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (id: string, subscriptionData: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    setIsLoading(true);
    setError(null);

    try {
      const updateData: SubscriptionUpdate = {};
      
      if (subscriptionData.name !== undefined) updateData.name = subscriptionData.name;
      if (subscriptionData.cost !== undefined) updateData.cost = subscriptionData.cost;
      if (subscriptionData.frequency !== undefined) updateData.frequency = subscriptionData.frequency;
      if (subscriptionData.category !== undefined) updateData.category = subscriptionData.category;
      if (subscriptionData.startDate !== undefined) updateData.start_date = subscriptionData.startDate;
      if (subscriptionData.description !== undefined) updateData.description = subscriptionData.description;
      if (subscriptionData.website !== undefined) updateData.website = subscriptionData.website;

      const { data, error: updateError } = await db.subscriptions.update(id, updateData);
      
      if (updateError) {
        throw updateError;
      }

      if (data) {
        const updatedSubscription: Subscription = {
          id: data.id,
          name: data.name,
          cost: data.cost,
          frequency: data.frequency as 'Monthly' | 'Yearly',
          category: data.category,
          startDate: data.start_date,
          description: data.description || undefined,
          website: data.website || undefined,
          user_id: data.user_id,
          created_at: data.created_at || undefined,
          updated_at: data.updated_at || undefined,
        };

        setSubscriptions(prev => prev.map(sub => sub.id === id ? updatedSubscription : sub));
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscription = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await db.subscriptions.delete(id);
      
      if (deleteError) {
        throw deleteError;
      }

      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (err) {
      console.error('Error deleting subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscription = (id: string): Subscription | undefined => {
    return subscriptions.find(sub => sub.id === id);
  };

  const value: SubscriptionContextType = {
    subscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    getSubscription,
    isLoading,
    error,
    refreshSubscriptions,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
