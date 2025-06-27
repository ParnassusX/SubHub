# ⚙️ Settings & Categories Implementation Plan

**Current Issue**: Settings page has mock data, Categories need full CRUD functionality  
**Goal**: Complete implementation with proper Supabase integration and user preferences  
**Priority**: Transform placeholder functionality into production-ready features

---

## 🎯 **CURRENT STATE ANALYSIS**

### **Settings Page Issues**
- ❌ Uses localStorage instead of Supabase
- ❌ Limited functionality (mostly mock data)
- ❌ No user profile management
- ❌ Missing notification preferences
- ❌ No appearance customization

### **Categories Issues**
- ❌ No CRUD operations
- ❌ Hardcoded category list
- ❌ No custom category creation
- ❌ No category management interface

---

## 🔧 **SETTINGS PAGE COMPLETE IMPLEMENTATION**

### **1. User Profile Management**

#### **Profile Data Structure**
```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  timezone: string;
  currency: string;
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  created_at: string;
  updated_at: string;
}

interface UserPreferences {
  id: string;
  user_id: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  billing: BillingSettings;
}
```

#### **Supabase Schema**
```sql
-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- User preferences table
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  renewal_alerts BOOLEAN DEFAULT true,
  spending_alerts BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  auto_categorize BOOLEAN DEFAULT true,
  data_export_format TEXT DEFAULT 'csv',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
```

### **2. Complete Settings Interface**

#### **Settings Page Layout**
```typescript
const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
    { id: 'billing', label: 'Billing', icon: CreditCardIcon },
    { id: 'data', label: 'Data & Export', icon: DocumentArrowDownIcon }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-[#1a2332] rounded-lg p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#0f1a24]'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#1a2332] rounded-xl p-6">
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'privacy' && <PrivacySettings />}
        {activeTab === 'appearance' && <AppearanceSettings />}
        {activeTab === 'billing' && <BillingSettings />}
        {activeTab === 'data' && <DataExportSettings />}
      </div>
    </div>
  );
};
```

#### **Profile Settings Component**
```typescript
const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Profile Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={profile?.full_name || ''}
            onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
            className="w-full px-3 py-2 bg-[#0f1a24] border border-[#2e4e6b] rounded-lg text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile?.email || ''}
            disabled
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={profile?.timezone || 'UTC'}
            onChange={(e) => setProfile(prev => prev ? { ...prev, timezone: e.target.value } : null)}
            className="w-full px-3 py-2 bg-[#0f1a24] border border-[#2e4e6b] rounded-lg text-white"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={profile?.currency || 'USD'}
            onChange={(e) => setProfile(prev => prev ? { ...prev, currency: e.target.value } : null)}
            className="w-full px-3 py-2 bg-[#0f1a24] border border-[#2e4e6b] rounded-lg text-white"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
      </div>
      
      <button
        onClick={() => updateProfile(profile!)}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};
```

---

## 📂 **CATEGORIES MANAGEMENT SYSTEM**

### **1. Category Data Structure**

#### **Category Schema**
```sql
-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Default categories for new users
INSERT INTO categories (user_id, name, color, icon, is_default) VALUES
  (NULL, 'Entertainment', '#ef4444', '🎬', true),
  (NULL, 'Productivity', '#3b82f6', '💼', true),
  (NULL, 'Development', '#10b981', '💻', true),
  (NULL, 'Health', '#ec4899', '🏥', true),
  (NULL, 'Finance', '#6366f1', '💰', true),
  (NULL, 'Education', '#f59e0b', '📚', true);

-- RLS Policy
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own categories" ON categories FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
```

### **2. Categories Management Interface**

#### **Categories Page**
```typescript
const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <button
          onClick={() => setIsAddingCategory(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {isAddingCategory && (
        <AddCategoryModal
          onClose={() => setIsAddingCategory(false)}
          onAdd={(category) => {
            setCategories(prev => [...prev, category]);
            setIsAddingCategory(false);
          }}
        />
      )}
    </div>
  );
};

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  return (
    <div className="bg-[#1a2332] rounded-xl p-6 border border-[#2e4e6b]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: category.color + '20', color: category.color }}
          >
            {category.icon}
          </div>
          <div>
            <h3 className="font-medium text-white">{category.name}</h3>
            <p className="text-sm text-gray-400">
              {category.is_default ? 'Default' : 'Custom'}
            </p>
          </div>
        </div>
        
        {!category.is_default && (
          <div className="flex space-x-2">
            <button className="text-gray-400 hover:text-white">
              <PencilIcon className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-red-400">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-400">
        Used by {category.subscription_count || 0} subscriptions
      </div>
    </div>
  );
};
```

---

## 🚀 **IMPLEMENTATION PLAN**

### **Phase 1: Database Schema (1 hour)**
- Create profiles and user_preferences tables
- Set up categories table with default data
- Implement RLS policies

### **Phase 2: Settings Page Implementation (3-4 hours)**
- Build tabbed settings interface
- Implement profile management
- Add notification preferences
- Create appearance settings

### **Phase 3: Categories Management (2-3 hours)**
- Build categories CRUD interface
- Implement category creation/editing
- Add category assignment to subscriptions
- Create category analytics

### **Phase 4: Integration & Testing (1 hour)**
- Connect settings to existing components
- Test data persistence
- Verify user experience flow

**Expected Outcome**: Complete settings and categories functionality with proper Supabase integration, giving users full control over their preferences and subscription organization.
