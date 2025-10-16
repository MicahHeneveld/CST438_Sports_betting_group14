const { test, expect } = require('@playwright/test');

test.describe('🎯 Live Signup Demo - Connect to Running App', () => {
  
  test('should connect to your running Expo app and demo signup', async ({ page }) => {
    console.log('🚀 Connecting to your running Expo app...');
    
    // Navigate directly to the running Expo web app
    await page.goto('/', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    console.log('✅ Connected to your Sports Betting App!');
    
    // Take screenshot of what we see
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/live-app-01-loaded.png',
      fullPage: true 
    });
    
    // Show what's on the page
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    const bodyText = await page.textContent('body');
    console.log('📝 Page content preview:', bodyText.substring(0, 300) + '...');
    
    // Count interactive elements
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    const links = await page.locator('a').count();
    
    console.log(`📊 Found: ${buttons} buttons, ${inputs} inputs, ${links} links`);
    
    // Look for navigation to signup
    console.log('🔍 Looking for signup/account creation elements...');
    
    // Check for common signup text
    const signupTexts = [
      'Create Account',
      'Sign Up', 
      'Register',
      'Account Creation',
      'New Account'
    ];
    
    for (const text of signupTexts) {
      const elements = page.locator(`text="${text}"`);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ Found "${text}" - ${count} instance(s)`);
        
        // Highlight and potentially click
        try {
          await elements.first().scrollIntoViewIfNeeded();
          await elements.first().hover();
          
          // Take screenshot with highlighted element
          await page.screenshot({ 
            path: `e2e-tests/screenshots/live-app-02-found-${text.toLowerCase().replace(' ', '-')}.png`,
            fullPage: true 
          });
          
          console.log(`🎯 Would click "${text}" to navigate to signup...`);
          // Uncomment next line to actually click:
          // await elements.first().click();
          // await page.waitForLoadState('domcontentloaded');
          
        } catch (error) {
          console.log(`ℹ️ Could not interact with "${text}": ${error.message}`);
        }
      }
    }
    
    // If we have form fields, test them
    if (inputs > 0) {
      console.log('📝 Testing form interactions on current page...');
      
      const allInputs = page.locator('input');
      
      for (let i = 0; i < Math.min(inputs, 4); i++) {
        try {
          const input = allInputs.nth(i);
          const placeholder = await input.getAttribute('placeholder');
          const type = await input.getAttribute('type');
          
          console.log(`📝 Input ${i + 1}: placeholder="${placeholder}", type="${type}"`);
          
          // Test filling based on placeholder/type
          if (placeholder?.toLowerCase().includes('username') || placeholder?.toLowerCase().includes('user')) {
            await input.fill('demouser123');
            console.log('✅ Filled username field');
          } else if (placeholder?.toLowerCase().includes('email') || type === 'email') {
            await input.fill('demo@example.com');
            console.log('✅ Filled email field');
          } else if (placeholder?.toLowerCase().includes('password') || type === 'password') {
            await input.fill('DemoPassword123!');
            console.log('✅ Filled password field');
          } else {
            await input.fill('test data');
            console.log(`✅ Filled input ${i + 1} with test data`);
          }
          
          await page.screenshot({ 
            path: `e2e-tests/screenshots/live-app-03-filled-input-${i + 1}.png` 
          });
          
        } catch (error) {
          console.log(`⚠️ Could not fill input ${i + 1}: ${error.message}`);
        }
      }
    }
    
    // Test button interactions
    if (buttons > 0) {
      console.log('🔘 Testing button interactions...');
      
      const allButtons = page.locator('button');
      
      for (let i = 0; i < Math.min(buttons, 3); i++) {
        try {
          const button = allButtons.nth(i);
          const text = await button.textContent();
          
          console.log(`🔘 Button ${i + 1}: "${text}"`);
          
          // Hover over buttons to show interaction
          await button.hover();
          await page.waitForTimeout(1000);
          
        } catch (error) {
          console.log(`⚠️ Could not interact with button ${i + 1}: ${error.message}`);
        }
      }
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/live-app-04-demo-complete.png',
      fullPage: true 
    });
    
    console.log('✅ Live signup demo completed!');
    console.log('📸 Screenshots saved showing your actual running app');
    console.log('🎯 This demonstrates E2E testing on your real Sports Betting App');
  });
});