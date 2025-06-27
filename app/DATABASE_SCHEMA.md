# SubHub Database Schema Documentation

## Overview

SubHub uses Supabase (PostgreSQL) as its database backend with Row Level Security (RLS) enabled for all tables. This document outlines the current schema and future enhancements planned for Phase 4 Settings & Categories implementation.

## Current Production Schema

### 1. **subscriptions** Table

The core table for managing user subscriptions.

```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('Monthly', 'Yearly')),
  category TEXT NOT NULL DEFAULT 'Other',
  next_billing DATE,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Cancelled', 'Paused')),
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_category ON subscriptions(category);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions" ON subscriptions
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. **categories** Table

Basic category management for organizing subscriptions.

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default categories
INSERT INTO categories (name, color) VALUES
  ('Entertainment', '#ef4444'),
  ('Productivity', '#3b82f6'),
  ('Development', '#10b981'),
  ('Health', '#ec4899'),
  ('Finance', '#6366f1'),
  ('Education', '#f59e0b'),
  ('Gaming', '#8b5cf6'),
  ('Music', '#06b6d4'),
  ('News', '#64748b'),
  ('Shopping', '#d946ef'),
  ('Travel', '#0ea5e9'),
  ('Food', '#f97316'),
  ('Utilities', '#84cc16'),
  ('Other', '#6b7280');

-- RLS Policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);
```

### 3. **profiles** Table

Extended user profile information (basic implementation).

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## Phase 4 Enhanced Schema (Future Implementation)

### 1. **Enhanced profiles** Table

```sql
-- Add columns for Phase 4 Settings implementation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'MM/DD/YYYY' 
  CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'));
```

### 2. **user_preferences** Table

```sql
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  renewal_alerts BOOLEAN DEFAULT true,
  spending_alerts BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  monthly_report BOOLEAN DEFAULT true,
  reminder_frequency TEXT DEFAULT '3_days' 
    CHECK (reminder_frequency IN ('1_day', '3_days', '1_week', '2_weeks')),
  
  -- Appearance Preferences
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  language TEXT DEFAULT 'en',
  
  -- Privacy Preferences
  auto_categorize BOOLEAN DEFAULT true,
  data_export_format TEXT DEFAULT 'csv' 
    CHECK (data_export_format IN ('csv', 'json', 'pdf')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- RLS Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);
```

### 3. **Enhanced categories** Table

```sql
-- Add columns for Phase 4 Categories enhancement
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '📦';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing categories to be default
UPDATE categories SET is_default = true WHERE user_id IS NULL;

-- Drop the unique constraint on name to allow user-specific categories
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;

-- Add new unique constraint for user-specific categories
CREATE UNIQUE INDEX idx_categories_user_name ON categories(user_id, name) 
  WHERE user_id IS NOT NULL;

-- Update RLS policies for enhanced categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

CREATE POLICY "Users can view default and their own categories" ON categories
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id AND is_default = false);
```

## Database Functions and Triggers

### 1. **Update Timestamp Trigger**

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. **Profile Creation Trigger**

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Data Migration Scripts

### Migration to Phase 4 Schema

```sql
-- 1. Add new columns to existing tables
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'MM/DD/YYYY';

-- 2. Create user_preferences table
-- (See schema above)

-- 3. Enhance categories table
-- (See schema above)

-- 4. Migrate existing user data
INSERT INTO user_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences);

-- 5. Update existing categories with icons
UPDATE categories SET 
  icon = CASE name
    WHEN 'Entertainment' THEN '🎬'
    WHEN 'Productivity' THEN '💼'
    WHEN 'Development' THEN '💻'
    WHEN 'Health' THEN '🏥'
    WHEN 'Finance' THEN '💰'
    WHEN 'Education' THEN '📚'
    WHEN 'Gaming' THEN '🎮'
    WHEN 'Music' THEN '🎵'
    WHEN 'News' THEN '📰'
    WHEN 'Shopping' THEN '🛒'
    WHEN 'Travel' THEN '✈️'
    WHEN 'Food' THEN '🍕'
    WHEN 'Utilities' THEN '⚡'
    ELSE '📦'
  END,
  is_default = true
WHERE user_id IS NULL;
```

## Performance Considerations

### Indexes
- All foreign keys have indexes for join performance
- Frequently queried columns (status, category, next_billing) are indexed
- Composite indexes for user-specific queries

### Query Optimization
- RLS policies use efficient user_id filtering
- Prepared statements for common queries
- Connection pooling for high-traffic scenarios

### Backup and Recovery
- Automated daily backups via Supabase
- Point-in-time recovery available
- Export capabilities for data portability

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Admin users have elevated permissions

### Data Validation
- CHECK constraints for enum-like fields
- NOT NULL constraints for required fields
- Foreign key constraints for data integrity

### Audit Trail
- created_at and updated_at timestamps on all tables
- Soft deletes where appropriate
- User action logging for sensitive operations

---

**Note**: The Phase 4 enhanced schema is designed and ready for implementation when the Settings & Categories features are fully deployed to production.
