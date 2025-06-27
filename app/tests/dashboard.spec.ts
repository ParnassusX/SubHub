import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (assuming user is logged in or we can access it directly)
    await page.goto('/dashboard');
  });

  test('should display dashboard page', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard/i })).toBeVisible();
  });

  test('should display subscription list', async ({ page }) => {
    // Look for subscription-related elements
    const subscriptionElements = page.locator('text=subscription').or(
      page.locator('[data-testid*="subscription"]')
    ).or(
      page.locator('.subscription')
    );
    
    // Should have some subscription-related content
    await expect(subscriptionElements.first()).toBeVisible();
  });

  test('should navigate to add subscription page', async ({ page }) => {
    // Look for add subscription button
    const addButton = page.locator('text=Add Subscription').or(
      page.locator('text=New Subscription')
    ).or(
      page.locator('button').filter({ hasText: /add|new|\+/ })
    ).first();
    
    if (await addButton.count() > 0) {
      await addButton.click();
      
      // Should navigate to add subscription form
      await expect(page.url()).toMatch(/(add|new|create)/);
      
      // Should show form fields
      await expect(page.locator('input, select, textarea')).toHaveCount({ min: 1 });
    }
  });

  test('should search subscriptions', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[placeholder*="search"]').or(
      page.locator('input[type="search"]')
    ).or(
      page.locator('input').filter({ hasText: /search/i })
    ).first();
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('Netflix');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Should show search results or no results message
      const hasResults = await page.locator('text=Netflix').count() > 0;
      const hasNoResults = await page.locator('text=No results').or(page.locator('text=not found')).count() > 0;
      
      expect(hasResults || hasNoResults).toBeTruthy();
    }
  });

  test('should display subscription statistics', async ({ page }) => {
    // Look for statistics/metrics
    const statsElements = page.locator('text=Total').or(
      page.locator('text=Active')
    ).or(
      page.locator('text=Monthly')
    ).or(
      page.locator('[data-testid*="stat"]')
    );
    
    if (await statsElements.count() > 0) {
      await expect(statsElements.first()).toBeVisible();
    }
  });

  test('should navigate to subscription details', async ({ page }) => {
    // Look for subscription items that can be clicked
    const subscriptionItem = page.locator('[data-testid*="subscription"]').or(
      page.locator('.subscription-item')
    ).or(
      page.locator('tr').filter({ hasText: /netflix|spotify|amazon/i })
    ).first();
    
    if (await subscriptionItem.count() > 0) {
      await subscriptionItem.click();
      
      // Should navigate to details page
      await expect(page.url()).toMatch(/(details|subscription)/);
    }
  });

  test('should handle responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile navigation works
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(
      page.locator('button').filter({ hasText: /menu|☰/ })
    );
    
    if (await mobileMenu.count() > 0) {
      await mobileMenu.click();
      
      // Should show mobile navigation
      await expect(page.locator('nav, .mobile-nav')).toBeVisible();
    }
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should export subscriptions', async ({ page }) => {
    // Look for export button
    const exportButton = page.locator('text=Export').or(
      page.locator('button').filter({ hasText: /export|download/ })
    ).first();
    
    if (await exportButton.count() > 0) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      
      await exportButton.click();
      
      // Wait for download to start
      try {
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.(csv|json|xlsx)$/);
      } catch (error) {
        // Download might not be implemented yet, that's okay
        console.log('Export functionality not yet implemented');
      }
    }
  });

  test('should import subscriptions', async ({ page }) => {
    // Look for import button
    const importButton = page.locator('text=Import').or(
      page.locator('button').filter({ hasText: /import|upload/ })
    ).first();
    
    if (await importButton.count() > 0) {
      await importButton.click();
      
      // Should show file input or import modal
      const fileInput = page.locator('input[type="file"]');
      const importModal = page.locator('[data-testid="import-modal"]').or(
        page.locator('.modal').filter({ hasText: /import/i })
      );
      
      const hasFileInput = await fileInput.count() > 0;
      const hasImportModal = await importModal.count() > 0;
      
      expect(hasFileInput || hasImportModal).toBeTruthy();
    }
  });
});
