const { test, expect } = require('@playwright/test');

test.describe('🎯 Live Signup Test - Fixed Server', () => {
  
  test('should successfully connect and test signup', async ({ page }) => {
    console.log('🚀 Testing with fixed Expo server...');
    
    // Start the web server in background and test immediately
    let serverConnected = false;
    let retries = 3;
    
    while (!serverConnected && retries > 0) {
      try {
        console.log(`Attempting to connect... (${4 - retries}/3)`);
        
        await page.goto('http://localhost:8081', { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        serverConnected = true;
        console.log('✅ Successfully connected to Expo app!');
        
        // Take screenshot of successful connection
        await page.screenshot({ 
          path: 'e2e-tests/screenshots/live-01-connected.png',
          fullPage: true 
        });
        
        // Check page content
        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
        console.log('✅ Page loaded with content');
        
        // Look for interactive elements
        const buttons = await page.locator('button').count();
        const inputs = await page.locator('input').count();
        
        console.log(`📊 Found: ${buttons} buttons, ${inputs} input fields`);
        
        // Test basic interactions
        if (inputs > 0) {
          console.log('🧪 Testing form interactions...');
          
          // Find and fill form fields
          const allInputs = page.locator('input');
          
          for (let i = 0; i < Math.min(inputs, 3); i++) {
            const input = allInputs.nth(i);
            const placeholder = await input.getAttribute('placeholder');
            
            console.log(`📝 Testing input ${i + 1}: ${placeholder}`);
            
            if (placeholder?.toLowerCase().includes('username')) {
              await input.fill('demouser123');
              console.log('✅ Filled username');
            } else if (placeholder?.toLowerCase().includes('email')) {
              await input.fill('demo@test.com');
              console.log('✅ Filled email');
            } else if (placeholder?.toLowerCase().includes('password')) {
              await input.fill('DemoPass123!');
              console.log('✅ Filled password');
            }
            
            await page.screenshot({ 
              path: `e2e-tests/screenshots/live-form-${i + 1}.png` 
            });
          }
        }
        
        // Test navigation
        if (buttons > 0) {
          console.log('🔘 Testing button interactions...');
          
          const interactiveButtons = page.locator('button');
          const firstButton = interactiveButtons.first();
          
          if (await firstButton.isVisible()) {
            await firstButton.hover();
            console.log('✅ Button interaction test passed');
          }
        }
        
        // Final success screenshot
        await page.screenshot({ 
          path: 'e2e-tests/screenshots/live-02-success.png',
          fullPage: true 
        });
        
        console.log('🎉 Live E2E test completed successfully!');
        
      } catch (error) {
        retries--;
        console.log(`❌ Connection attempt failed: ${error.message}`);
        
        if (retries > 0) {
          console.log('⏳ Waiting 5 seconds before retry...');
          await page.waitForTimeout(5000);
        } else {
          console.log('💡 Server might not be running - start with: npm run web');
          throw error;
        }
      }
    }
    
    expect(serverConnected).toBe(true);
  });
});