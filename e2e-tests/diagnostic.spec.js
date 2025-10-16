const { test, expect } = require('@playwright/test');

test.describe('🔧 Diagnostic Test - No Server Required', () => {
  
  test('should test Playwright is working', async ({ page }) => {
    console.log('🧪 Testing Playwright installation...');
    
    // Test that Playwright can navigate to any website
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
    
    console.log('✅ Playwright is working correctly!');
    
    // Take a screenshot to prove it works
    await page.screenshot({ path: 'e2e-tests/screenshots/diagnostic-example.png' });
  });

  test('should test local server connection attempts', async ({ page }) => {
    console.log('🔍 Testing different local ports...');
    
    const ports = [8081, 19006, 19000, 3000, 8080];
    const results = [];
    
    for (const port of ports) {
      try {
        console.log(`Trying port ${port}...`);
        
        // Set a short timeout for each attempt
        await page.goto(`http://localhost:${port}`, { 
          waitUntil: 'domcontentloaded', 
          timeout: 3000 
        });
        
        const title = await page.title();
        console.log(`✅ Port ${port} responded - Title: "${title}"`);
        
        results.push({ port, status: 'success', title });
        
        await page.screenshot({ 
          path: `e2e-tests/screenshots/port-${port}-success.png` 
        });
        
      } catch (error) {
        console.log(`❌ Port ${port} failed: ${error.message}`);
        results.push({ port, status: 'failed', error: error.message });
      }
    }
    
    console.log('📊 Port scan results:', results);
    
    // At least one port should work if we manually start the server
    const workingPorts = results.filter(r => r.status === 'success');
    console.log(`Found ${workingPorts.length} working ports`);
  });

  test('should provide debugging information', async ({ page }) => {
    console.log('🔧 Gathering debugging information...');
    
    const info = {
      userAgent: await page.evaluate(() => navigator.userAgent),
      url: page.url(),
      timestamp: new Date().toISOString()
    };
    
    console.log('🖥️ Browser info:', info);
    
    // Test file system access for screenshots
    try {
      await page.screenshot({ path: 'e2e-tests/screenshots/debug-info.png' });
      console.log('✅ Screenshot system working');
    } catch (error) {
      console.log('❌ Screenshot error:', error.message);
    }
    
    console.log('📝 Next steps:');
    console.log('1. Fix Expo web server stability');
    console.log('2. Ensure app loads without crashing');
    console.log('3. Check network connectivity');
    console.log('4. Verify dependencies are compatible');
  });
});