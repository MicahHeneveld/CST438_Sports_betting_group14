const { test, expect } = require('@playwright/test');

class SignupDemo {
  constructor(page) {
    this.page = page;
  }

  async addTalkingPoint(title, description, duration = 4000) {
    // Display talking point overlay
    await this.page.evaluate(({ title, description }) => {
      // Remove existing overlay
      const existingOverlay = document.querySelector('#demo-overlay');
      if (existingOverlay) existingOverlay.remove();

      // Create overlay
      const overlay = document.createElement('div');
      overlay.id = 'demo-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 15px;
        max-width: 350px;
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
      `;
      
      overlay.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #fff; font-size: 18px;">${title}</h3>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.9);">${description}</p>
        <div style="margin-top: 15px; font-size: 12px; color: rgba(255,255,255,0.7); display: flex; align-items: center;">
          <span style="margin-right: 8px;">🎤</span>
          <span>Automated Demo Point</span>
        </div>
      `;
      
      document.body.appendChild(overlay);
    }, { title, description });

    console.log(`\n🎤 ${title}`);
    console.log(`📝 ${description}`);
    
    await this.page.waitForTimeout(duration);
    
    // Remove overlay
    await this.page.evaluate(() => {
      const overlay = document.querySelector('#demo-overlay');
      if (overlay) overlay.remove();
    });
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `demo-presentation/screenshots/signup-${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  async simulateTyping(selector, text, delay = 150) {
    try {
      const element = this.page.locator(selector);
      await element.clear();
      
      for (const char of text) {
        await element.type(char);
        await this.page.waitForTimeout(delay);
      }
    } catch (error) {
      console.log(`Could not type in ${selector}: ${error.message}`);
    }
  }

  async highlightElement(selector, color = '#ff4444', duration = 2000) {
    try {
      await this.page.evaluate(({ selector, color }) => {
        const element = document.querySelector(selector);
        if (element) {
          element.style.outline = `3px solid ${color}`;
          element.style.outlineOffset = '3px';
          element.style.transition = 'all 0.3s ease';
        }
      }, { selector, color });
      
      await this.page.waitForTimeout(duration);
      
      await this.page.evaluate(({ selector }) => {
        const element = document.querySelector(selector);
        if (element) {
          element.style.outline = '';
          element.style.outlineOffset = '';
        }
      }, { selector });
    } catch (error) {
      console.log(`Could not highlight ${selector}: ${error.message}`);
    }
  }
}

test.describe('🎯 Automated Signup Page Demo', () => {
  
  test('Complete Signup Demo with Live Commentary', async ({ page }) => {
    const demo = new SignupDemo(page);
    
    console.log('\n🚀 Starting Automated Signup Demo...\n');

    // Try to connect to the app with retries
    let connected = false;
    let retries = 5;
    
    while (!connected && retries > 0) {
      try {
        await page.goto('http://localhost:8081', { 
          waitUntil: 'domcontentloaded',
          timeout: 8000 
        });
        connected = true;
        console.log('✅ Connected to Sports Betting App');
      } catch (error) {
        retries--;
        console.log(`⏳ Waiting for server... (${5-retries}/5)`);
        if (retries > 0) {
          await page.waitForTimeout(3000);
        } else {
          throw new Error('❌ Could not connect to app. Please run: npm run web');
        }
      }
    }

    await demo.takeScreenshot('01-app-loaded');
    
    // Demo Introduction
    await demo.addTalkingPoint(
      '🏆 Sports Betting App Demo',
      'Welcome! This is our React Native sports betting application built with Expo. We\'ll demonstrate the user registration process with automated form filling.',
      5000
    );

    // Look for the current page content
    const pageContent = await page.textContent('body');
    console.log('📄 Page content preview:', pageContent.substring(0, 200) + '...');

    // Check what's on the current page
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    const links = await page.locator('a').count();
    
    console.log(`📊 Found: ${buttons} buttons, ${inputs} inputs, ${links} links`);

    await demo.addTalkingPoint(
      '🔍 Analyzing Current Page',
      `The app has loaded with ${buttons} interactive buttons and ${inputs} input fields. We'll now navigate to find the signup functionality.`,
      4000
    );

    // Look for signup/create account elements
    const signupElements = [
      'button:has-text("Create Account")',
      'button:has-text("Sign Up")',
      'button:has-text("Register")',
      'a:has-text("Create Account")',
      'a:has-text("Sign Up")',
      '[data-testid*="signup"]',
      '[data-testid*="register"]'
    ];

    let foundSignup = false;
    
    for (const selector of signupElements) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`✅ Found signup element: ${selector}`);
          await demo.highlightElement(selector, '#00ff00');
          
          await demo.addTalkingPoint(
            '🎯 Signup Navigation',
            'Perfect! We\'ve located the account creation interface. Now we\'ll navigate to the signup form.',
            3000
          );
          
          await element.click();
          await page.waitForLoadState('domcontentloaded');
          foundSignup = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!foundSignup) {
      await demo.addTalkingPoint(
        '📱 Direct Form Access',
        'We\'re accessing the signup form directly. The app may be showing the registration interface already or we\'ll work with the current form elements.',
        4000
      );
    }

    await demo.takeScreenshot('02-signup-page');

    // Look for form fields after navigation
    const formFields = {
      username: [
        'input[placeholder*="username" i]',
        'input[placeholder*="user" i]',
        'input[name*="username" i]',
        'input[name*="user" i]'
      ],
      email: [
        'input[placeholder*="email" i]',
        'input[type="email"]',
        'input[name*="email" i]'
      ],
      password: [
        'input[placeholder*="password" i]',
        'input[type="password"]',
        'input[name*="password" i]'
      ],
      confirmPassword: [
        'input[placeholder*="confirm" i]',
        'input[placeholder*="repeat" i]',
        'input[name*="confirm" i]'
      ]
    };

    // Demo form filling
    await demo.addTalkingPoint(
      '📝 Form Field Detection',
      'Now we\'ll demonstrate the automated form filling process. Our E2E testing framework can identify and interact with all form elements.',
      4000
    );

    const formData = {
      username: 'demo_user_2024',
      email: 'demo.user@sportsbet.app',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!'
    };

    for (const [fieldType, selectors] of Object.entries(formFields)) {
      let fieldFound = false;
      
      for (const selector of selectors) {
        try {
          const field = page.locator(selector);
          if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log(`✅ Found ${fieldType} field: ${selector}`);
            
            await demo.highlightElement(selector, '#4CAF50');
            
            await demo.addTalkingPoint(
              `📊 ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
              `Filling the ${fieldType} field with test data. Notice the realistic typing simulation for demonstration purposes.`,
              3000
            );
            
            await demo.simulateTyping(selector, formData[fieldType]);
            await demo.takeScreenshot(`03-${fieldType}-filled`);
            
            fieldFound = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!fieldFound) {
        console.log(`⚠️ ${fieldType} field not found, continuing...`);
      }
    }

    // Look for submit button
    const submitSelectors = [
      'button:has-text("Create Account")',
      'button:has-text("Sign Up")',
      'button:has-text("Register")',
      'button:has-text("Submit")',
      'button[type="submit"]'
    ];

    let submitFound = false;
    for (const selector of submitSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
          await demo.highlightElement(selector, '#ff6b35');
          
          await demo.addTalkingPoint(
            '🚀 Form Submission',
            'All fields are completed! In a real test, we would now submit the form and verify the account creation process. For this demo, we\'ll highlight the submit button.',
            4000
          );
          
          submitFound = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    await demo.takeScreenshot('04-form-complete');

    // Demo conclusion
    await demo.addTalkingPoint(
      '✅ Demo Complete',
      'This automated demo showcased our E2E testing capabilities for the signup process. The framework can handle form validation, error states, and complete user workflows.',
      5000
    );

    await demo.addTalkingPoint(
      '🎯 Testing Features',
      'Our E2E framework supports cross-browser testing, mobile simulation, screenshot capture, video recording, and automated user journey validation.',
      4000
    );

    await demo.takeScreenshot('05-demo-complete');

    console.log('\n✅ Automated Signup Demo Completed Successfully!');
    console.log('📸 Screenshots saved to demo-presentation/screenshots/');
    console.log('🎥 Video recording available in test-results/');
  });
});