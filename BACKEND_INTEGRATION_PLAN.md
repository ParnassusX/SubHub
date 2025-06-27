# SubHub Backend Integration Plan

## 🎯 Executive Summary

This document outlines the comprehensive plan to transform SubHub from static HTML prototypes into a full-stack subscription management application using **Supabase** as the backend, **React** for the frontend, and **Stripe** for payment processing.

## 📊 Current State Analysis

### ✅ What We Have
- **Static HTML Prototypes**: 13 well-designed pages with TailwindCSS
- **Development Environment**: Working localhost setup with navigation
- **Existing Branches**: 
  - `mvp-initial-setup-attempt`: React components and setup guides
  - `jules_wip_6923693874928186171`: Full-stack structure with Express.js backend
- **Linux Compatibility**: Fixed file naming and project structure

### 🎯 Target Architecture
- **Frontend**: React.js with TypeScript
- **Backend**: Supabase (Database + Auth + Real-time)
- **UI Components**: shadcn/ui + TailwindCSS
- **Payment Processing**: Stripe
- **Deployment**: Vercel (Frontend) + Supabase (Backend)

## 🏗️ Database Schema Design

### Core Tables

#### 1. User Management
```sql
-- Extends Supabase auth.users
CREATE TABLE users (
  id uuid REFERENCES auth.users PRIMARY KEY,
  full_name text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  currency_preference text DEFAULT 'USD',
  notification_preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 2. Subscription Services (Master Catalog)
```sql
CREATE TABLE subscription_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  website_url text,
  category_id uuid REFERENCES categories(id),
  typical_pricing jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

#### 3. Categories
```sql
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  color text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

#### 4. User Subscriptions (Core Feature)
```sql
CREATE TABLE user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  service_id uuid REFERENCES subscription_services(id),
  custom_name text,
  cost decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  billing_cycle text NOT NULL, -- monthly, yearly, weekly
  next_billing_date date NOT NULL,
  start_date date NOT NULL,
  end_date date,
  category_id uuid REFERENCES categories(id),
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### 5. Notifications
```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subscription_id uuid REFERENCES user_subscriptions(id),
  type text NOT NULL, -- billing_reminder, price_change, etc.
  title text NOT NULL,
  message text NOT NULL,
  scheduled_for timestamptz,
  sent_at timestamptz,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

### Stripe Integration Tables
```sql
-- For SubHub's own billing (if it becomes a paid service)
CREATE TABLE customers (
  id uuid REFERENCES auth.users PRIMARY KEY,
  stripe_customer_id text UNIQUE
);

CREATE TABLE products (
  id text PRIMARY KEY, -- Stripe product ID
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);

CREATE TABLE prices (
  id text PRIMARY KEY, -- Stripe price ID
  product_id text REFERENCES products(id),
  active boolean,
  currency text,
  unit_amount bigint,
  type text, -- one_time, recurring
  interval text, -- month, year
  interval_count integer,
  trial_period_days integer
);

CREATE TABLE subscriptions (
  id text PRIMARY KEY, -- Stripe subscription ID
  user_id uuid REFERENCES auth.users NOT NULL,
  status text,
  price_id text REFERENCES prices(id),
  quantity integer,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now()
);
```

## 🔐 Authentication & Authorization

### Supabase Auth Features
- **Email/Password Authentication**
- **OAuth Providers**: Google, GitHub, Apple
- **Magic Links**: Passwordless login
- **Row Level Security (RLS)**: Database-level authorization

### Auth Flow
1. User signs up/logs in via Supabase Auth
2. User profile created automatically via database trigger
3. JWT tokens managed by Supabase
4. Frontend receives session data
5. RLS policies enforce data access

### RLS Policies Example
```sql
-- Users can only see their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only modify their own subscriptions
CREATE POLICY "Users can modify own subscriptions" ON user_subscriptions
  FOR ALL USING (auth.uid() = user_id);
```

## 💳 Payment Integration Strategy

### Stripe Setup
- **Products**: SubHub pricing plans (Free, Pro, Enterprise)
- **Webhooks**: Sync subscription status with Supabase
- **Customer Portal**: Self-service billing management
- **Test Mode**: Development and testing

### Payment Flow
1. User selects pricing plan
2. Stripe Checkout session created
3. Payment processed by Stripe
4. Webhook updates Supabase database
5. User gains access to premium features

### Ready-to-Use Components
Based on research, we'll use the **Stripe + Supabase integration pattern** from the DEV.to tutorial, which provides:
- Pre-built checkout components
- Webhook handlers
- Database sync functions
- Customer portal integration

## 🎨 UI Component Strategy

### Primary: shadcn/ui
- **Modern**: Built on Radix UI primitives
- **Customizable**: Copy-paste components
- **Accessible**: WCAG compliant
- **TypeScript**: Full type safety
- **TailwindCSS**: Consistent with current design

### Key Components Needed
- **Forms**: Add/edit subscription forms
- **Data Tables**: Subscription lists with sorting/filtering
- **Calendar**: Billing date visualization
- **Charts**: Spending analytics
- **Modals**: Confirmation dialogs
- **Notifications**: Toast messages

### Alternative Options
- **Mantine**: Comprehensive component library
- **Ant Design**: Enterprise-grade components
- **Chakra UI**: Simple and modular

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up development environment and basic structure

**Tasks**:
- [ ] Merge existing React components from MVP branch
- [ ] Set up Supabase project and database
- [ ] Implement authentication with Supabase Auth UI
- [ ] Create basic routing with React Router
- [ ] Set up shadcn/ui components
- [ ] Implement basic user profile management

**Deliverables**:
- Working React app with authentication
- Basic user dashboard
- Database schema implemented

### Phase 2: Core Features (Week 3-4)
**Goal**: Implement subscription management functionality

**Tasks**:
- [ ] Build subscription CRUD operations
- [ ] Implement category management
- [ ] Create subscription list/grid views
- [ ] Add subscription forms with validation
- [ ] Implement basic notifications
- [ ] Create spending calculations

**Deliverables**:
- Full subscription management
- Category organization
- Basic analytics

### Phase 3: Advanced Features (Week 5-6)
**Goal**: Add premium features and polish

**Tasks**:
- [ ] Implement calendar view for billing dates
- [ ] Build advanced analytics and reports
- [ ] Add import/export functionality
- [ ] Create notification system
- [ ] Implement search and filtering
- [ ] Add data visualization charts

**Deliverables**:
- Calendar integration
- Advanced reporting
- Data management tools

### Phase 4: Stripe Integration (Week 7-8)
**Goal**: Monetize the application

**Tasks**:
- [ ] Set up Stripe products and pricing
- [ ] Implement subscription checkout
- [ ] Create webhook handlers
- [ ] Build customer portal
- [ ] Add feature gating for premium users
- [ ] Implement usage analytics

**Deliverables**:
- Payment processing
- Subscription management
- Premium features

### Phase 5: Polish & Deploy (Week 9-10)
**Goal**: Production-ready application

**Tasks**:
- [ ] Performance optimization
- [ ] Error handling and logging
- [ ] Security audit
- [ ] Mobile responsiveness
- [ ] SEO optimization
- [ ] Production deployment

**Deliverables**:
- Production deployment
- Documentation
- User onboarding

## 🛠️ Development Tools & Extensions

### Required VS Code Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "prettier": "^3.0.0",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}
```

## 📈 Success Metrics

### Technical Metrics
- **Performance**: < 3s initial load time
- **Accessibility**: WCAG 2.1 AA compliance
- **Security**: No critical vulnerabilities
- **Test Coverage**: > 80%

### Business Metrics
- **User Engagement**: Daily active users
- **Feature Adoption**: Subscription tracking usage
- **Conversion**: Free to paid conversion rate
- **Retention**: Monthly user retention

## 🔄 Next Steps

1. **Review and approve this plan**
2. **Set up development environment**
3. **Begin Phase 1 implementation**
4. **Regular progress reviews**
5. **Iterate based on feedback**

---

*This plan provides a comprehensive roadmap for transforming SubHub into a production-ready subscription management application. Each phase builds upon the previous one, ensuring steady progress toward the final goal.*
