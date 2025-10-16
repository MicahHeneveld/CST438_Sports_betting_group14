// Simple script to connect to your existing browser session
const { chromium } = require('playwright');

async function connectToExistingBrowser() {
  console.log('🔗 Attempting to connect to your existing browser...');
  
  try {
    // Connect to existing browser on the debug port
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    
    if (contexts.length > 0) {
      const context = contexts[0];
      const pages = context.pages();
      
      if (pages.length > 0) {
        const page = pages[0];
        
        console.log('✅ Connected to existing browser tab!');
        console.log('Current URL:', await page.url());
        
        // Navigate to your Expo app if not already there
        if (!await page.url().includes('localhost:8081')) {
          await page.goto('http://localhost:8081');
          console.log('📱 Navigated to your Expo app');
        }
        
        // Take screenshot of current state
        await page.screenshot({ path: 'existing-browser-demo.png' });
        console.log('📸 Screenshot saved: existing-browser-demo.png');
        
        await browser.close();
        return;
      }
    }
    
    console.log('❌ Could not find existing browser session');
    
  } catch (error) {
    console.log('❌ Could not connect to existing browser:', error.message);
    console.log('💡 Try starting Chrome with: chrome --remote-debugging-port=9222');
  }
}

connectToExistingBrowser();