-- Migration: Add budget fields to profiles table
-- This migration adds the missing budget management fields that are critical for production

-- 1. Add budget fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS monthly_budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS yearly_budget DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS category_budgets JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget_alerts_enabled BOOLEAN DEFAULT true;

-- 2. Create indexes for budget queries
CREATE INDEX IF NOT EXISTS idx_profiles_monthly_budget ON profiles(monthly_budget) WHERE monthly_budget IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_yearly_budget ON profiles(yearly_budget) WHERE yearly_budget IS NOT NULL;

-- 3. Add constraints for budget validation
ALTER TABLE profiles 
ADD CONSTRAINT check_monthly_budget_positive 
  CHECK (monthly_budget IS NULL OR monthly_budget >= 0);

ALTER TABLE profiles 
ADD CONSTRAINT check_yearly_budget_positive 
  CHECK (yearly_budget IS NULL OR yearly_budget >= 0);

-- 4. Create function to validate category budgets JSON structure
CREATE OR REPLACE FUNCTION validate_category_budgets(budgets JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if it's a valid JSON object
  IF jsonb_typeof(budgets) != 'object' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if all values are positive numbers
  IF EXISTS (
    SELECT 1 FROM jsonb_each(budgets) 
    WHERE jsonb_typeof(value) != 'number' OR (value::numeric) < 0
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Add constraint for category budgets validation
ALTER TABLE profiles 
ADD CONSTRAINT check_category_budgets_valid 
  CHECK (category_budgets IS NULL OR validate_category_budgets(category_budgets));

-- 6. Initialize budget settings for existing users
UPDATE profiles 
SET 
  monthly_budget = NULL,
  yearly_budget = NULL,
  category_budgets = '{}',
  budget_alerts_enabled = true
WHERE monthly_budget IS NULL 
  AND yearly_budget IS NULL 
  AND category_budgets IS NULL 
  AND budget_alerts_enabled IS NULL;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION validate_category_budgets(JSONB) TO authenticated;

-- 8. Create function to get user budget summary
CREATE OR REPLACE FUNCTION get_user_budget_summary(user_uuid UUID)
RETURNS TABLE (
  monthly_budget DECIMAL(10,2),
  yearly_budget DECIMAL(10,2),
  category_budgets JSONB,
  budget_alerts_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.monthly_budget,
    p.yearly_budget,
    p.category_budgets,
    p.budget_alerts_enabled
  FROM profiles p
  WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_budget_summary(UUID) TO authenticated;

-- 10. Add comment for documentation
COMMENT ON COLUMN profiles.monthly_budget IS 'User monthly subscription budget limit';
COMMENT ON COLUMN profiles.yearly_budget IS 'User yearly subscription budget limit';
COMMENT ON COLUMN profiles.category_budgets IS 'JSON object containing category-specific budget limits';
COMMENT ON COLUMN profiles.budget_alerts_enabled IS 'Whether budget alerts are enabled for the user';
