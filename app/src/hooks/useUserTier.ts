import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SubscriptionTier } from '../services/premiumFeaturesService';

/**
 * Hook to manage user's subscription tier
 * Currently returns 'free' for all users
 * TODO: Connect to database user_tier field when payment system is integrated
 */
export const useUserTier = () => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const loadTier = async () => {
      setIsLoading(true);
      
      // TODO: Fetch from database
      // const { data } = await supabase
      //   .from('profiles')
      //   .select('subscription_tier')
      //   .eq('id', user?.id)
      //   .single();
      // setTier(data?.subscription_tier || 'free');

      // For now, check localStorage for demo purposes
      const storedTier = localStorage.getItem('user_tier') as SubscriptionTier;
      setTier(storedTier || 'free');
      
      setIsLoading(false);
    };

    if (user) {
      loadTier();
    }
  }, [user]);

  const upgradeTier = (newTier: SubscriptionTier) => {
    // TODO: Implement actual payment flow
    // For now, just update localStorage
    localStorage.setItem('user_tier', newTier);
    setTier(newTier);
    
    // Show success message
    console.log(`Upgraded to ${newTier} tier!`);
  };

  const downgradeTier = () => {
    // TODO: Implement cancellation flow
    localStorage.setItem('user_tier', 'free');
    setTier('free');
  };

  return {
    tier,
    isLoading,
    isPremium: tier === 'premium' || tier === 'enterprise',
    isEnterprise: tier === 'enterprise',
    upgradeTier,
    downgradeTier
  };
};
