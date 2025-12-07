-- Migration: Add logo_url field to subscriptions table
-- This allows storing fetched service logos

-- Add logo_url column to subscriptions
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add index for better query performance when filtering by logo presence
CREATE INDEX IF NOT EXISTS idx_subscriptions_logo_url 
ON subscriptions(logo_url) 
WHERE logo_url IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.logo_url IS 'URL or data URI of the service logo, auto-fetched from Clearbit/Google/DuckDuckGo or generated as letter avatar';
