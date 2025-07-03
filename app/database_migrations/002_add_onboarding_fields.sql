-- Migration: Add onboarding fields to user_preferences table
-- This migration adds the missing onboarding tracking fields

-- 1. Add onboarding fields to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_step TEXT,
ADD COLUMN IF NOT EXISTS completed_steps TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS skipped_steps TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_seen_premium_features BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS conversion_opportunities_shown TEXT[] DEFAULT '{}';

-- 2. Add name field to profiles table (for onboarding profile setup)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name TEXT;

-- 3. Create index for onboarding queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_onboarding_completed 
ON user_preferences(onboarding_completed);

-- 4. Create function to mark onboarding as completed
CREATE OR REPLACE FUNCTION public.complete_user_onboarding(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_preferences 
  SET 
    onboarding_completed = true,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create function to check if user has completed onboarding
CREATE OR REPLACE FUNCTION public.is_onboarding_completed(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_completed BOOLEAN;
BEGIN
  SELECT onboarding_completed INTO is_completed
  FROM user_preferences 
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(is_completed, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.complete_user_onboarding(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_onboarding_completed(UUID) TO authenticated;
