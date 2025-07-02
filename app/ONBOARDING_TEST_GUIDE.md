# SubHub Onboarding System Test Guide

## 🧪 Manual Testing Checklist

### **1. Landing Page Accessibility Test (FIXED)**
- [ ] Navigate to `http://localhost:5173/` (should show landing page)
- [ ] Navigate to `http://localhost:5173/landing` (should show landing page)
- [ ] Verify landing page loads without authentication
- [ ] **CRITICAL**: Verify NO onboarding overlay appears on landing page
- [ ] Check that login/register buttons work correctly

### **2. Authentication Flow Test (FIXED)**
- [ ] Click "Sign In" on landing page → should go to `/login`
- [ ] Login with valid credentials → should redirect to `/dashboard`
- [ ] Click "Get Started" on landing page → should go to `/register`
- [ ] Register new account → should redirect to `/dashboard`
- [ ] **CRITICAL**: No redirect loops between landing/login/dashboard

### **3. New User Onboarding Flow Test**
- [ ] Register a new user account
- [ ] Verify redirect to `/dashboard` after registration
- [ ] Verify onboarding overlay appears automatically (only for authenticated users)
- [ ] Check that only ONE primary action button is visible per step
- [ ] Verify button is clearly visible within the modal (not cut off)

#### **Step-by-Step Onboarding Test:**

**Step 1: Welcome Step**
- [ ] Verify welcome message displays
- [ ] Check "Continue" button is visible and functional
- [ ] Test ESC key to exit (should work)

**Step 2: Profile Setup**
- [ ] Fill in name field
- [ ] Verify "Continue" button becomes enabled
- [ ] Check status message shows "Profile ready"
- [ ] Test saving profile data

**Step 3: First Subscription**
- [ ] Fill in subscription details (name, cost)
- [ ] Verify button text changes to "Add Subscription"
- [ ] Check status message shows "Ready to add"
- [ ] Test adding subscription
- [ ] Verify subscription appears in dashboard after completion

**Step 4: Notification Setup**
- [ ] Configure notification preferences
- [ ] Verify "Continue" button works
- [ ] Check settings are saved

**Step 5: Budget Setup**
- [ ] Set budget preferences
- [ ] Test completion

**Step 6: Dashboard Tour**
- [ ] Complete tour
- [ ] Verify navigation

**Step 7: Premium Features**
- [ ] Review premium features
- [ ] Complete onboarding

### **4. Existing User Test (FIXED)**

- [ ] Login with existing user (test@subhub.com / test123456)
- [ ] Verify redirect to `/dashboard` after login
- [ ] Verify onboarding does NOT appear for existing users
- [ ] Check normal dashboard functionality

### **4. Button Visibility Test**
- [ ] During onboarding, verify only ONE primary action button per step
- [ ] Check button is within modal bounds (not cut off)
- [ ] Verify button text is appropriate for each step
- [ ] Test button disabled states work correctly

### **5. Error Handling Test**
- [ ] Test with invalid form data
- [ ] Verify error messages display correctly
- [ ] Check recovery from errors

### **6. Context Provider Test**
- [ ] Verify no "useSubscriptions must be used within SubscriptionProvider" errors
- [ ] Check no "useAuth must be used within AuthProvider" errors
- [ ] Test all step components load without context errors

## 🔧 Debug Tools Available

### **Test Panel (Bottom-right corner in development)**
- **Reset Onboarding**: Force restart onboarding for current user
- **Disable/Enable Onboarding**: Toggle onboarding system
- **Test Flow**: Log detailed state information to console
- **Exit Current**: Exit active onboarding session

### **Console Commands**
```javascript
// Available in development mode
window.SubHubDebug.resetOnboarding(userId)
window.SubHubDebug.showOnboarding()
window.SubHubDebug.disableOnboarding()
window.SubHubDebug.enableOnboarding()
```

### **Browser Console Debugging**
1. Open Developer Tools (F12)
2. Check Console tab for errors
3. Look for onboarding-related logs
4. Use Test Panel "Test Flow" button for detailed state

## 🔧 CRITICAL FIXES APPLIED

### **Authentication Flow Fixes:**
- ✅ **Onboarding Overlay**: Moved inside ProtectedRoute (only for authenticated users)
- ✅ **Login Redirect**: Fixed to redirect to `/dashboard` instead of `/`
- ✅ **Register Redirect**: Fixed to redirect to `/dashboard` instead of `/`
- ✅ **ProtectedRoute**: Updated to redirect to `/login` for unauthenticated users
- ✅ **Route Separation**: Clear separation between public and protected routes

### **Navigation Fixes:**
- ✅ **Landing Page**: No onboarding interference for non-authenticated users
- ✅ **Login Flow**: Proper redirect chain: Landing → Login → Dashboard
- ✅ **Register Flow**: Proper redirect chain: Landing → Register → Dashboard
- ✅ **No Redirect Loops**: Eliminated circular redirects between routes

## ✅ Success Criteria

**All tests pass if:**
- ✅ Landing page accessible without authentication (NO onboarding overlay)
- ✅ Login/Register redirect to `/dashboard` (not `/`)
- ✅ New users see onboarding automatically (only after authentication)
- ✅ Only ONE clear primary action button per step
- ✅ Buttons are fully visible within modal
- ✅ All steps complete without errors
- ✅ Existing users skip onboarding
- ✅ No context provider errors
- ✅ No redirect loops in authentication flow
- ✅ Data persists correctly after onboarding

## 🚨 Common Issues to Check

1. **Duplicate Buttons**: Ensure no step has both internal buttons AND footer buttons
2. **Button Visibility**: Check buttons aren't cut off by modal height
3. **Context Errors**: Verify all providers are properly nested
4. **Data Persistence**: Confirm onboarding data saves to database/localStorage
5. **Loading States**: Check loading indicators work correctly
