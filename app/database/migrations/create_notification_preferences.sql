-- Create notification_preferences table for Phase 2.1: Intelligent Notification System
-- This table stores user preferences for various notification types

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Renewal reminder settings
  renewal_reminder_enabled BOOLEAN DEFAULT true,
  renewal_reminder_days INTEGER[] DEFAULT '{1,3,7}',
  
  -- Spending threshold settings
  spending_threshold_enabled BOOLEAN DEFAULT true,
  spending_threshold_amount DECIMAL(10,2),
  spending_threshold_percentage INTEGER DEFAULT 80, -- Alert when 80% of budget is reached
  
  -- Unused subscription detection
  unused_subscription_enabled BOOLEAN DEFAULT true,
  unused_subscription_days INTEGER DEFAULT 30,
  
  -- Price change notifications
  price_change_enabled BOOLEAN DEFAULT true,
  
  -- Notification delivery preferences
  email_notifications_enabled BOOLEAN DEFAULT true,
  push_notifications_enabled BOOLEAN DEFAULT true,
  in_app_notifications_enabled BOOLEAN DEFAULT true,
  
  -- Quiet hours (24-hour format)
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  
  -- Frequency limits to prevent spam
  max_daily_notifications INTEGER DEFAULT 5,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique constraint on user_id (one preference record per user)
CREATE UNIQUE INDEX IF NOT EXISTS notification_preferences_user_id_unique 
ON notification_preferences(user_id);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification preferences" 
ON notification_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" 
ON notification_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" 
ON notification_preferences FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification preferences" 
ON notification_preferences FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Create default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;
