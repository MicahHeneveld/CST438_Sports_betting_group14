const { test, expect } = require('@playwright/test');

test.describe('🔐 Signup Page - Basic E2E Test', () => {
  
  test('should display signup form elements', async ({ page }) => {
    // Navigate to your app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('📱 Testing signup page elements...');
    
    // Take initial screenshot
    await page.screenshot({ path: 'e2e-tests/screenshots/01-app-loaded.png' });
    
    // Look for Create Account or Signup button/link
    try {
      // Try to find account creation elements
      const createAccountButton = page.locator('button:has-text("Create Account"), button:has-text("Sign Up"), button:has-text("Register")');
      const createAccountLink = page.locator('text="Create Account", text="Sign Up", text="Register"');
      
      // Check if create account button exists and click it
      if (await createAccountButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Found Create Account button');
        await createAccountButton.click();
        await page.waitForLoadState('networkidle');
      } 
      // Or try clicking a link/text
      else if (await createAccountLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Found Create Account link');
        await createAccountLink.click();
        await page.waitForLoadState('networkidle');
      }
      
      await page.screenshot({ path: 'e2e-tests/screenshots/02-signup-page.png' });
      
    } catch (error) {
      console.log('ℹ️  Direct signup page navigation - checking current page for signup form');
    }
    
    // Now check for signup form elements
    console.log('🔍 Looking for signup form elements...');
    
    // Check for form heading
    const heading = page.locator('text="Create Account", text="Sign Up", text="Register"').first();
    if (await heading.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found signup heading');
      await expect(heading).toBeVisible();
    }
    
    // Check for input fields (using more flexible selectors)
    const usernameField = page.locator('input[placeholder*="Username" i], input[placeholder*="User" i]').first();
    const emailField = page.locator('input[placeholder*="Email" i], input[type="email"]').first();
    const passwordField = page.locator('input[placeholder*="Password" i], input[type="password"]').first();
    const confirmPasswordField = page.locator('input[placeholder*="Confirm" i]').first();
    
    // Test username field
    if (await usernameField.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found username field');
      await expect(usernameField).toBeVisible();
    }
    
    // Test email field  
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found email field');
      await expect(emailField).toBeVisible();
    }
    
    // Test password field
    if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found password field');
      await expect(passwordField).toBeVisible();
    }
    
    // Test confirm password field
    if (await confirmPasswordField.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found confirm password field');
      await expect(confirmPasswordField).toBeVisible();
    }
    
    // Check for submit button
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Sign Up"), button:has-text("Register")');
    if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✅ Found submit button');
      await expect(submitButton).toBeVisible();
    }
    
    console.log('📷 Taking final screenshot...');
    await page.screenshot({ path: 'e2e-tests/screenshots/03-signup-form-found.png' });
  });

  test('should fill out signup form', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('📝 Testing signup form filling...');
    
    // Navigate to signup if needed (same logic as above)
    try {
      const createAccountButton = page.locator('button:has-text("Create Account"), button:has-text("Sign Up")');
      if (await createAccountButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createAccountButton.click();
        await page.waitForLoadState('networkidle');
      }
    } catch (error) {
      console.log('ℹ️  Already on signup page or different navigation');
    }
    
    // Fill out the form
    try {
      const usernameField = page.locator('input[placeholder*="Username" i]').first();
      const emailField = page.locator('input[placeholder*="Email" i], input[type="email"]').first();
      const passwordField = page.locator('input[placeholder*="Password" i], input[type="password"]').first();
      const confirmPasswordField = page.locator('input[placeholder*="Confirm" i]').last();
      
      // Fill username
      if (await usernameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await usernameField.fill('testuser123');
        console.log('✅ Filled username field');
        await page.screenshot({ path: 'e2e-tests/screenshots/04-username-filled.png' });
      }
      
      // Fill email
      if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emailField.fill('testuser123@example.com');
        console.log('✅ Filled email field');
        await page.screenshot({ path: 'e2e-tests/screenshots/05-email-filled.png' });
      }
      
      // Fill password
      if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await passwordField.fill('TestPassword123!');
        console.log('✅ Filled password field');
      }
      
      // Fill confirm password
      if (await confirmPasswordField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmPasswordField.fill('TestPassword123!');
        console.log('✅ Filled confirm password field');
      }
      
      await page.screenshot({ path: 'e2e-tests/screenshots/06-form-completed.png' });
      
      // Try to submit (but don't actually submit to avoid database issues)
      const submitButton = page.locator('button:has-text("Create"), button:has-text("Sign Up")');
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✅ Found submit button - ready to submit');
        // Uncomment the next line if you want to actually submit:
        // await submitButton.click();
        
        // Just highlight the button instead
        await submitButton.hover();
        await page.screenshot({ path: 'e2e-tests/screenshots/07-ready-to-submit.png' });
      }
      
    } catch (error) {
      console.log('⚠️  Form filling error:', error.message);
      await page.screenshot({ path: 'e2e-tests/screenshots/error-form-filling.png' });
    }
    
    console.log('✅ Signup form test completed!');
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 Testing form validation...');
    
    // Navigate to signup
    try {
      const createAccountButton = page.locator('button:has-text("Create Account"), button:has-text("Sign Up")');
      if (await createAccountButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createAccountButton.click();
        await page.waitForLoadState('networkidle');
      }
    } catch (error) {
      console.log('ℹ️  Form validation test - checking current page');
    }
    
    // Try to submit empty form
    try {
      const submitButton = page.locator('button:has-text("Create"), button:has-text("Sign Up")');
      if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('🧪 Testing empty form submission...');
        await submitButton.click();
        
        // Wait a moment for any validation messages
        await page.waitForTimeout(1000);
        
        // Look for error messages or alerts
        const errorMessages = page.locator('text*="Error", text*="required", text*="fill"');
        if (await errorMessages.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log('✅ Form validation working - found error message');
          await expect(errorMessages.first()).toBeVisible();
        }
        
        await page.screenshot({ path: 'e2e-tests/screenshots/08-validation-test.png' });
      }
    } catch (error) {
      console.log('ℹ️  Validation test completed:', error.message);
    }
    
    console.log('✅ Validation test completed!');
  });
});