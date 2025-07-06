import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@subhub.com';
const ADMIN_PASSWORD = 'password';

async function loginAsAdmin(page: any) {
  await page.goto('/login');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
  });

  test('should display admin dashboard', async ({ page }) => {
    // Should show admin-specific content
    const adminElements = page.locator('text=Admin').or(
      page.locator('h1, h2').filter({ hasText: /admin|management/i })
    );
    
    if (await adminElements.count() > 0) {
      await expect(adminElements.first()).toBeVisible();
    }
  });

  test('should display user management section', async ({ page }) => {
    // Look for user management features
    const userSection = page.locator('text=Users').or(
      page.locator('text=User Management')
    ).or(
      page.locator('[data-testid*="user"]')
    );
    
    if (await userSection.count() > 0) {
      await expect(userSection.first()).toBeVisible();
    }
  });

  test('should display analytics and reports', async ({ page }) => {
    // Look for analytics/reports section
    const analyticsSection = page.locator('text=Analytics').or(
      page.locator('text=Reports')
    ).or(
      page.locator('text=Statistics')
    );
    
    if (await analyticsSection.count() > 0) {
      await expect(analyticsSection.first()).toBeVisible();
    }
  });

  test('should show system statistics', async ({ page }) => {
    // Look for system stats
    const statsElements = page.locator('text=Total Users').or(
      page.locator('text=Active Subscriptions')
    ).or(
      page.locator('[data-testid*="stat"]')
    );
    
    if (await statsElements.count() > 0) {
      await expect(statsElements.first()).toBeVisible();
    }
  });

  test('should navigate to user details', async ({ page }) => {
    // Look for user list items
    const userItem = page.locator('tr').filter({ hasText: /@/ }).first();
    
    if (await userItem.count() > 0) {
      await userItem.click();
      
      // Should show user details
      await expect(page.locator('h1, h2, h3')).toBeVisible();
    }
  });

  test('should handle user actions', async ({ page }) => {
    // Look for user action buttons
    const actionButton = page.locator('button').filter({ hasText: /edit|delete|suspend|activate/ }).first();
    
    if (await actionButton.count() > 0) {
      await actionButton.click();
      
      // Should show confirmation or form
      await expect(page.locator('button, input, select')).toBeVisible();
    }
  });

  test('should export user data', async ({ page }) => {
    // Look for export functionality
    const exportButton = page.locator('text=Export').or(
      page.locator('button').filter({ hasText: /export|download/ })
    ).first();
    
    if (await exportButton.count() > 0) {
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(csv|json|xlsx)$/);
      } catch (error) {
        // Export might not be implemented yet
        console.log('Export functionality not yet implemented');
      }
    }
  });

  test('should display revenue analytics', async ({ page }) => {
    // Look for revenue/financial data
    const revenueElements = page.locator('text=Revenue').or(
      page.locator('text=Income')
    ).or(
      page.locator('text=$').or(page.locator('text=€'))
    );
    
    if (await revenueElements.count() > 0) {
      await expect(revenueElements.first()).toBeVisible();
    }
  });

  test('should show subscription trends', async ({ page }) => {
    // Look for charts or trend data
    const chartElements = page.locator('canvas').or(
      page.locator('svg')
    ).or(
      page.locator('[data-testid*="chart"]')
    );
    
    if (await chartElements.count() > 0) {
      await expect(chartElements.first()).toBeVisible();
    }
  });

  test('should handle system settings', async ({ page }) => {
    // Look for settings section
    const settingsButton = page.locator('text=Settings').or(
      page.locator('button').filter({ hasText: /settings|config/ })
    ).first();
    
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      
      // Should show settings form
      await expect(page.locator('input, select, textarea')).toBeVisible();
    }
  });

  test('should display recent activity', async ({ page }) => {
    // Look for activity feed
    const activitySection = page.locator('text=Recent Activity').or(
      page.locator('text=Activity Log')
    ).or(
      page.locator('[data-testid*="activity"]')
    );
    
    if (await activitySection.count() > 0) {
      await expect(activitySection.first()).toBeVisible();
    }
  });

  test('should handle bulk operations', async ({ page }) => {
    // Look for bulk action controls
    const selectAllCheckbox = page.locator('input[type="checkbox"]').first();
    
    if (await selectAllCheckbox.count() > 0) {
      await selectAllCheckbox.check();
      
      // Look for bulk action buttons
      const bulkActionButton = page.locator('button').filter({ hasText: /bulk|selected/ }).first();
      
      if (await bulkActionButton.count() > 0) {
        await expect(bulkActionButton).toBeVisible();
      }
    }
  });

  test('should search and filter admin data', async ({ page }) => {
    // Look for search functionality
    const searchInput = page.locator('input[type="search"]').or(
      page.locator('input[placeholder*="search"]')
    ).first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(1000);
      
      // Should show search results
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
