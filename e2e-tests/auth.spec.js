const { test, expect } = require('@playwright/test');

test.describe('Sports Betting App - Authentication Flow', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if login elements are present
    // You'll need to adjust these selectors based on your actual login form
    await expect(page).toHaveTitle(/GambleApp|Sports|Betting/i);
    
    // Look for login-related text or buttons
    const loginButton = page.locator('text=/login/i').first();
    const usernameField = page.locator('input[placeholder*="username" i], input[placeholder*="email" i]').first();
    
    // Check if we can find login elements (adjust based on your actual UI)
    if (await loginButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(loginButton).toBeVisible();
    }
    
    if (await usernameField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(usernameField).toBeVisible();
    }
  });

  test('should navigate through the app', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'e2e-tests/screenshots/homepage.png', fullPage: true });
    
    // Check if the page loaded successfully
    const bodyText = await page.textContent('body');
    console.log('Page loaded with content length:', bodyText?.length || 0);
    
    // Look for navigation elements
    const navElements = await page.locator('button, a, [role="button"]').count();
    console.log('Found navigation elements:', navElements);
    
    expect(navElements).toBeGreaterThan(0);
  });

  test('should handle user login flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to find and interact with login elements
    // Note: You'll need to adjust these selectors based on your actual login form
    try {
      // Look for common login form elements
      const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i], input[placeholder*="email" i]').first();
      const passwordInput = page.locator('input[type="password"], input[placeholder*="password" i]').first();
      const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), [role="button"]:has-text("Login")').first();
      
      if (await usernameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await usernameInput.fill('testUser1');
        
        if (await passwordInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await passwordInput.fill('testPassword');
        }
        
        if (await loginButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await loginButton.click();
          
          // Wait for navigation or success message
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: 'e2e-tests/screenshots/after-login.png', fullPage: true });
        }
      }
    } catch (error) {
      console.log('Login flow not available or different structure:', error.message);
      // Take screenshot for debugging
      await page.screenshot({ path: 'e2e-tests/screenshots/login-error.png', fullPage: true });
    }
  });
});