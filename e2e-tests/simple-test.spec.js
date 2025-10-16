const { test, expect } = require('@playwright/test');

test.describe('🔐 Simple Signup Test - Manual Server', () => {
  
  test('should connect to app and find basic elements', async ({ page }) => {
    console.log('🌐 Testing basic connection...');
    
    try {
      // Try to connect to the locally running app
      await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
      
      console.log('✅ Successfully connected to the app!');
      
      // Take a screenshot to see what we have
      await page.screenshot({ path: 'e2e-tests/screenshots/basic-01-connected.png', fullPage: true });
      
      // Check if the page loaded (any content)
      const bodyText = await page.textContent('body');
      expect(bodyText.length).toBeGreaterThan(0);
      console.log('✅ Page has content:', bodyText.substring(0, 100) + '...');
      
      // Look for any buttons or interactive elements
      const buttons = await page.locator('button').count();
      const inputs = await page.locator('input').count();
      const links = await page.locator('a').count();
      
      console.log(`📊 Found: ${buttons} buttons, ${inputs} inputs, ${links} links`);
      
      // Look for common text that might indicate login/signup area
      const signupText = page.locator('text=/sign up|create|account|register/i');
      const loginText = page.locator('text=/login|sign in/i');
      
      if (await signupText.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Found signup-related text');
        await signupText.first().highlight();
      }
      
      if (await loginText.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('✅ Found login-related text');
        await loginText.first().highlight();
      }
      
      // Take final screenshot
      await page.screenshot({ path: 'e2e-tests/screenshots/basic-02-elements-found.png', fullPage: true });
      
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('💡 Make sure to run "npm run web" in another terminal first');
      
      // Take screenshot of error page
      await page.screenshot({ path: 'e2e-tests/screenshots/basic-error.png' });
      throw error;
    }
  });

  test('should find and interact with form elements', async ({ page }) => {
    console.log('📝 Testing form interactions...');
    
    try {
      await page.goto('http://localhost:8081', { waitUntil: 'networkidle' });
      
      // Look for any input fields
      const allInputs = page.locator('input');
      const inputCount = await allInputs.count();
      
      console.log(`🔍 Found ${inputCount} input fields`);
      
      if (inputCount > 0) {
        // Try to interact with the first few inputs
        for (let i = 0; i < Math.min(inputCount, 4); i++) {
          const input = allInputs.nth(i);
          const placeholder = await input.getAttribute('placeholder');
          const type = await input.getAttribute('type');
          
          console.log(`📝 Input ${i + 1}: placeholder="${placeholder}", type="${type}"`);
          
          // Try to fill the input based on its type/placeholder
          if (placeholder?.toLowerCase().includes('username') || placeholder?.toLowerCase().includes('user')) {
            await input.fill('testuser123');
            console.log('✅ Filled username field');
          } else if (placeholder?.toLowerCase().includes('email') || type === 'email') {
            await input.fill('test@example.com');
            console.log('✅ Filled email field');
          } else if (placeholder?.toLowerCase().includes('password') || type === 'password') {
            await input.fill('TestPassword123!');
            console.log('✅ Filled password field');
          } else {
            await input.fill('test value');
            console.log(`✅ Filled input ${i + 1} with test value`);
          }
          
          // Take screenshot after each fill
          await page.screenshot({ path: `e2e-tests/screenshots/form-step-${i + 1}.png` });
        }
      }
      
      // Look for submit buttons
      const submitButtons = page.locator('button:has-text("submit"), button:has-text("create"), button:has-text("sign")');
      const buttonCount = await submitButtons.count();
      
      if (buttonCount > 0) {
        console.log(`🔘 Found ${buttonCount} potential submit buttons`);
        await submitButtons.first().hover();
        await page.screenshot({ path: 'e2e-tests/screenshots/form-ready-submit.png' });
      }
      
    } catch (error) {
      console.log('❌ Form test failed:', error.message);
      await page.screenshot({ path: 'e2e-tests/screenshots/form-error.png' });
      throw error;
    }
  });
});