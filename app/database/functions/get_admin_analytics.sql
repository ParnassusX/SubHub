-- Admin Analytics RPC Function for SubHub
-- This function provides comprehensive analytics for the admin dashboard
-- Returns JSON with user statistics, subscription metrics, and revenue data

CREATE OR REPLACE FUNCTION get_admin_analytics()
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_users INTEGER;
  active_users INTEGER;
  total_subscriptions INTEGER;
  active_subscriptions INTEGER;
  total_revenue DECIMAL(10,2);
  monthly_revenue DECIMAL(10,2);
  avg_subscriptions_per_user DECIMAL(10,2);
  top_categories JSON;
  recent_signups INTEGER;
  churn_rate DECIMAL(5,2);
  growth_rate DECIMAL(5,2);
BEGIN
  -- Basic user metrics
  SELECT COUNT(*) INTO total_users FROM auth.users;
  
  SELECT COUNT(DISTINCT user_id) INTO active_users 
  FROM subscriptions 
  WHERE created_at >= NOW() - INTERVAL '30 days';
  
  SELECT COUNT(DISTINCT user_id) INTO recent_signups
  FROM auth.users 
  WHERE created_at >= NOW() - INTERVAL '7 days';
  
  -- Subscription metrics
  SELECT COUNT(*) INTO total_subscriptions FROM subscriptions;
  
  SELECT COUNT(*) INTO active_subscriptions 
  FROM subscriptions 
  WHERE next_billing_date >= NOW();
  
  -- Revenue calculations (based on subscription costs)
  SELECT COALESCE(SUM(
    CASE 
      WHEN frequency = 'Monthly' THEN cost
      WHEN frequency = 'Yearly' THEN cost / 12
      ELSE cost
    END
  ), 0) INTO monthly_revenue
  FROM subscriptions;
  
  SELECT COALESCE(SUM(cost), 0) INTO total_revenue FROM subscriptions;
  
  -- Average subscriptions per user
  SELECT COALESCE(AVG(sub_count), 0) INTO avg_subscriptions_per_user
  FROM (
    SELECT COUNT(*) as sub_count 
    FROM subscriptions 
    GROUP BY user_id
  ) user_subs;
  
  -- Top categories
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'name', c.name,
      'count', category_counts.subscription_count,
      'color', c.color
    )
  ) INTO top_categories
  FROM (
    SELECT 
      category_id,
      COUNT(*) as subscription_count
    FROM subscriptions 
    WHERE category_id IS NOT NULL
    GROUP BY category_id
    ORDER BY subscription_count DESC
    LIMIT 5
  ) category_counts
  JOIN categories c ON c.id = category_counts.category_id;
  
  -- Calculate growth rate (month over month user growth)
  WITH monthly_users AS (
    SELECT 
      DATE_TRUNC('month', created_at) as month,
      COUNT(*) as new_users
    FROM auth.users
    WHERE created_at >= NOW() - INTERVAL '2 months'
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY month
  ),
  growth_calc AS (
    SELECT 
      LAG(new_users) OVER (ORDER BY month) as prev_month,
      new_users as current_month
    FROM monthly_users
  )
  SELECT COALESCE(
    CASE 
      WHEN prev_month > 0 THEN 
        ((current_month - prev_month)::DECIMAL / prev_month) * 100
      ELSE 0
    END, 0
  ) INTO growth_rate
  FROM growth_calc
  WHERE prev_month IS NOT NULL
  LIMIT 1;
  
  -- Calculate churn rate (users who haven't logged in for 30+ days)
  WITH inactive_users AS (
    SELECT COUNT(*) as inactive_count
    FROM auth.users u
    LEFT JOIN subscriptions s ON u.id = s.user_id
    WHERE u.last_sign_in_at < NOW() - INTERVAL '30 days'
    OR u.last_sign_in_at IS NULL
  )
  SELECT COALESCE(
    (inactive_count::DECIMAL / NULLIF(total_users, 0)) * 100, 0
  ) INTO churn_rate
  FROM inactive_users;
  
  -- Build final JSON result
  SELECT JSON_BUILD_OBJECT(
    'users', JSON_BUILD_OBJECT(
      'total', total_users,
      'active', active_users,
      'recent_signups', recent_signups,
      'growth_rate', growth_rate,
      'churn_rate', churn_rate
    ),
    'subscriptions', JSON_BUILD_OBJECT(
      'total', total_subscriptions,
      'active', active_subscriptions,
      'avg_per_user', avg_subscriptions_per_user
    ),
    'revenue', JSON_BUILD_OBJECT(
      'total', total_revenue,
      'monthly_recurring', monthly_revenue,
      'currency', 'USD'
    ),
    'categories', JSON_BUILD_OBJECT(
      'top_categories', COALESCE(top_categories, '[]'::JSON)
    ),
    'generated_at', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users with admin role
-- Note: This should be restricted to admin users only in production
CREATE POLICY "Admin users can execute analytics function" ON auth.users
FOR SELECT USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  )
);

-- Example usage:
-- SELECT get_admin_analytics();

-- Example result structure:
/*
{
  "users": {
    "total": 150,
    "active": 120,
    "recent_signups": 15,
    "growth_rate": 12.5,
    "churn_rate": 8.2
  },
  "subscriptions": {
    "total": 450,
    "active": 380,
    "avg_per_user": 3.2
  },
  "revenue": {
    "total": 15750.00,
    "monthly_recurring": 1312.50,
    "currency": "USD"
  },
  "categories": {
    "top_categories": [
      {"name": "Entertainment", "count": 120, "color": "#3B82F6"},
      {"name": "Productivity", "count": 85, "color": "#10B981"}
    ]
  },
  "generated_at": "2024-01-15T10:30:00Z"
}
*/
