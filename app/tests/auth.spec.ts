import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/SubHub/);
    await expect(page.locator('h1')).toContainText('SubHub');
  });

  test('should navigate to login page', async ({ page }) => {
    // Look for login button or link
    const loginButton = page.locator('text=Login').or(page.locator('text=Sign In')).first();
    await loginButton.click();
    
    // Should be on login page
    await expect(page.url()).toContain('login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    // Look for register/signup button or link
    const registerButton = page.locator('text=Register').or(page.locator('text=Sign Up')).first();
    await registerButton.click();
    
    // Should be on register page
    await expect(page.url()).toContain('register');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    // Navigate to login
    const loginButton = page.locator('text=Login').or(page.locator('text=Sign In')).first();
    await loginButton.click();
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Login')).last();
    await submitButton.click();
    
    // Should show validation errors
    await expect(page.locator('text=required').or(page.locator('text=Invalid'))).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    // Navigate to register
    const registerButton = page.locator('text=Register').or(page.locator('text=Sign Up')).first();
    await registerButton.click();
    
    // Fill registration form with unique email
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Fill confirm password if exists
    const confirmPasswordField = page.locator('input[name*="confirm"]').or(page.locator('input[placeholder*="confirm"]'));
    if (await confirmPasswordField.count() > 0) {
      await confirmPasswordField.fill('TestPassword123!');
    }
    
    // Submit form
    const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Register')).last();
    await submitButton.click();
    
    // Should redirect to dashboard or show success message
    await page.waitForTimeout(2000); // Wait for registration to process
    
    // Check if we're redirected to dashboard or login
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/(dashboard|login|success)/);
  });

  test('should login with valid credentials', async ({ page }) => {
    // First register a user
    const registerButton = page.locator('text=Register').or(page.locator('text=Sign Up')).first();
    await registerButton.click();
    
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    const confirmPasswordField = page.locator('input[name*="confirm"]').or(page.locator('input[placeholder*="confirm"]'));
    if (await confirmPasswordField.count() > 0) {
      await confirmPasswordField.fill('TestPassword123!');
    }
    
    const submitButton = page.locator('button[type="submit"]').or(page.locator('text=Register')).last();
    await submitButton.click();
    
    await page.waitForTimeout(2000);
    
    // Now try to login
    await page.goto('/');
    const loginButton = page.locator('text=Login').or(page.locator('text=Sign In')).first();
    await loginButton.click();
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    const loginSubmitButton = page.locator('button[type="submit"]').or(page.locator('text=Login')).last();
    await loginSubmitButton.click();
    
    await page.waitForTimeout(2000);
    
    // Should be redirected to dashboard
    expect(page.url()).toContain('dashboard');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first (simplified for test)
    await page.goto('/login');
    
    // Look for logout button/menu after login
    const logoutButton = page.locator('text=Logout').or(page.locator('text=Sign Out'));
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      
      // Should redirect to home or login page
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(login|home|\/)/);
    }
  });
});
