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
    const loadTier = async () => {
      setIsLoading(true);
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Try to load from user metadata (set by payment webhook)
      const userTier = user.user_metadata?.subscription_tier as SubscriptionTier;
      if (userTier) {
        setTier(userTier);
        // Also store in localStorage for quick access
        localStorage.setItem('user_tier', userTier);
        setIsLoading(false);
        return;
      }

      // Fallback to localStorage (for demo/testing)
      const storedTier = localStorage.getItem('user_tier') as SubscriptionTier;
      setTier(storedTier || 'free');
      
      setIsLoading(false);
    };

    if (user) {
      loadTier();
    }
  }, [user]);

  const upgradeTier = async (newTier: SubscriptionTier) => {
    // Store in localStorage for immediate UI update
    localStorage.setItem('user_tier', newTier);
    setTier(newTier);
    
    // In production, this would:
    // 1. Create Stripe checkout session
    // 2. Redirect to Stripe
    // 3. Webhook updates user metadata on success
    // 4. UI reflects change from user metadata
    
    console.log(`Upgrade to ${newTier} tier initiated. In production, this would redirect to payment.`);
  };

  const downgradeTier = async () => {
    // Store in localStorage for immediate UI update
    localStorage.setItem('user_tier', 'free');
    setTier('free');
    
    // In production, this would:
    // 1. Cancel Stripe subscription
    // 2. Webhook updates user metadata
    // 3. UI reflects change
    
    console.log('Downgrade to free tier initiated. In production, this would cancel subscription.');
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
