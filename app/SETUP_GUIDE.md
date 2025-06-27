# SubHub PocketBase Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Create Admin Account
1. Open http://127.0.0.1:8090/_/
2. Create admin account:
   - Email: `admin@subhub.com`
   - Password: `admin123456`

### Step 2: Create Collections

#### Collection 1: subscriptions
1. Click "New collection"
2. Name: `subscriptions`
3. Type: Base collection
4. Add these fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| user | relation | ✓ | Collection: users, Single select |
| name | text | ✓ | Min: 1, Max: 100 |
| cost | number | ✓ | Min: 0 |
| frequency | select | ✓ | Options: Monthly, Yearly |
| category | text | ✓ | Min: 1, Max: 50 |
| startDate | date | ✓ | - |
| description | text | ✗ | Max: 500 |
| website | url | ✗ | - |

**API Rules:**
- List/Search: `@request.auth.id != "" && user = @request.auth.id`
- View: `@request.auth.id != "" && user = @request.auth.id`
- Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- Update: `@request.auth.id != "" && user = @request.auth.id`
- Delete: `@request.auth.id != "" && user = @request.auth.id`

#### Collection 2: categories
1. Click "New collection"
2. Name: `categories`
3. Type: Base collection
4. Add these fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| user | relation | ✓ | Collection: users, Single select |
| name | text | ✓ | Min: 1, Max: 50 |
| color | text | ✓ | Min: 4, Max: 7 |

**API Rules:** (Same as subscriptions)
- List/Search: `@request.auth.id != "" && user = @request.auth.id`
- View: `@request.auth.id != "" && user = @request.auth.id`
- Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- Update: `@request.auth.id != "" && user = @request.auth.id`
- Delete: `@request.auth.id != "" && user = @request.auth.id`

#### Collection 3: notifications
1. Click "New collection"
2. Name: `notifications`
3. Type: Base collection
4. Add these fields:

| Field Name | Type | Required | Options |
|------------|------|----------|---------|
| user | relation | ✓ | Collection: users, Single select |
| type | select | ✓ | Options: payment_due, payment_overdue, renewal, price_change, info |
| title | text | ✓ | Min: 1, Max: 100 |
| message | text | ✓ | Min: 1, Max: 500 |
| subscription | relation | ✗ | Collection: subscriptions, Single select |
| isRead | bool | ✓ | Default: false |

**API Rules:** (Same as subscriptions)
- List/Search: `@request.auth.id != "" && user = @request.auth.id`
- View: `@request.auth.id != "" && user = @request.auth.id`
- Create: `@request.auth.id != "" && @request.data.user = @request.auth.id`
- Update: `@request.auth.id != "" && user = @request.auth.id`
- Delete: `@request.auth.id != "" && user = @request.auth.id`

### Step 3: Test the Application
1. Open http://localhost:5173/
2. Click "Sign up" to create a new user account
3. Add some subscriptions
4. Check the admin dashboard at /admin

## 🎉 You're Done!

SubHub is now fully functional with:
- ✅ Real user authentication
- ✅ Real database storage
- ✅ Data persistence
- ✅ Admin dashboard
- ✅ Responsive design

## 📊 Admin Access
- Admin Panel: http://127.0.0.1:8090/_/
- Login: admin@subhub.com / admin123456
- View all users and data

## 🔧 Troubleshooting

### If collections don't work:
1. Check API rules are set correctly
2. Make sure field types match exactly
3. Verify relation fields point to correct collections

### If authentication fails:
1. Check PocketBase is running on port 8090
2. Verify React app can connect to PocketBase
3. Check browser console for errors

### If data doesn't save:
1. Check API rules allow user access
2. Verify user is authenticated
3. Check PocketBase logs in admin panel
