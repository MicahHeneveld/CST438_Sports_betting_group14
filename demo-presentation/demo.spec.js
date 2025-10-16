const { test, expect } = require('@playwright/test');

class DemoPresentation {
  constructor(page) {
    this.page = page;
    this.currentSlide = 0;
    this.talkingPoints = [];
  }

  async addTalkingPoint(title, description, duration = 5000) {
    this.talkingPoints.push({ title, description, duration });
    
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
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 300px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      `;
      
      overlay.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #4CAF50;">${title}</h3>
        <p style="margin: 0; font-size: 14px; line-height: 1.4;">${description}</p>
        <div style="margin-top: 10px; font-size: 12px; color: #ccc;">
          🎤 Talking Point
        </div>
      `;
      
      document.body.appendChild(overlay);
    }, { title, description });

    // Wait for the specified duration or user input
    console.log(`\n🎤 TALKING POINT: ${title}`);
    console.log(`📝 ${description}`);
    console.log(`⏱️  Duration: ${duration/1000}s - Press ENTER to continue or wait...\n`);
    
    await this.page.waitForTimeout(duration);
    
    // Remove overlay
    await this.page.evaluate(() => {
      const overlay = document.querySelector('#demo-overlay');
      if (overlay) overlay.remove();
    });
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `demo-presentation/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }

  async highlight(selector, color = '#ff0000') {
    await this.page.evaluate(({ selector, color }) => {
      const element = document.querySelector(selector);
      if (element) {
        element.style.outline = `3px solid ${color}`;
        element.style.outlineOffset = '2px';
        setTimeout(() => {
          element.style.outline = '';
          element.style.outlineOffset = '';
        }, 3000);
      }
    }, { selector, color });
  }

  async simulateTyping(selector, text, delay = 100) {
    const element = this.page.locator(selector);
    await element.clear();
    
    for (const char of text) {
      await element.type(char);
      await this.page.waitForTimeout(delay);
    }
  }
}

test.describe('🎯 Sports Betting App - Live Demo Presentation', () => {
  test('📱 Complete App Demo with Talking Points', async ({ page }) => {
    const demo = new DemoPresentation(page);
    
    // Start recording
    await page.video?.path();
    
    console.log('\n🚀 Starting Sports Betting App Demo Presentation...\n');

    // Slide 1: Introduction
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await demo.takeScreenshot('01-app-launch');
    
    await demo.addTalkingPoint(
      '🏆 Welcome to Our Sports Betting App',
      'This is our React Native/Expo sports betting application. We\'ll walk through the key features including user authentication, team selection, and upcoming games.',
      8000
    );

    // Slide 2: Login Process
    await demo.addTalkingPoint(
      '🔐 User Authentication System',
      'Our app starts with a secure login system. Users can either log in with existing credentials or create a new account.',
      6000
    );

    try {
      // Look for login elements
      const loginElements = await page.locator('input, button').count();
      if (loginElements > 0) {
        await demo.highlight('input[type="text"], input:first-of-type', '#00ff00');
        
        // Simulate login
        const usernameField = page.locator('input').first();
        if (await usernameField.isVisible()) {
          await demo.simulateTyping('input:first-of-type', 'testUser1', 150);
          await demo.takeScreenshot('02-username-entered');
          
          await demo.addTalkingPoint(
            '👤 User Login Demo',
            'Here we\'re entering a test user credentials. The app validates user input and provides feedback.',
            5000
          );
        }
      }
    } catch (error) {
      console.log('Login elements not found, continuing demo...');
    }

    // Slide 3: Navigation Demo
    await demo.addTalkingPoint(
      '🧭 Navigation System',
      'Our app uses React Navigation with bottom tabs and stack navigation for smooth user experience across different screens.',
      6000
    );

    // Look for navigation elements
    const navButtons = page.locator('button, [role="button"], a');
    const navCount = await navButtons.count();
    
    if (navCount > 0) {
      for (let i = 0; i < Math.min(navCount, 3); i++) {
        const button = navButtons.nth(i);
        if (await button.isVisible()) {
          await demo.highlight(`button:nth-of-type(${i + 1})`, '#ffff00');
          await page.waitForTimeout(1000);
        }
      }
      await demo.takeScreenshot('03-navigation-highlighted');
    }

    // Slide 4: Database Integration
    await demo.addTalkingPoint(
      '🗄️ Database Integration',
      'The app integrates with SQLite for local data storage, managing user preferences, favorite teams, and betting history.',
      7000
    );

    // Slide 5: Team Selection Feature
    await demo.addTalkingPoint(
      '⚽ Team Selection & Favorites',
      'Users can browse and select their favorite teams. This data is stored locally and syncs with the betting interface.',
      6000
    );

    // Try to navigate to different sections
    try {
      const buttons = await page.locator('button, [role="button"]').all();
      for (const button of buttons.slice(0, 2)) {
        const text = await button.textContent();
        if (text && (text.includes('Team') || text.includes('Game') || text.includes('Favorite'))) {
          await button.click();
          await page.waitForLoadState('networkidle');
          await demo.takeScreenshot(`04-${text.toLowerCase().replace(' ', '-')}-section`);
          break;
        }
      }
    } catch (error) {
      console.log('Navigation elements not found, continuing...');
    }

    // Slide 6: API Integration
    await demo.addTalkingPoint(
      '🌐 API Integration',
      'The app fetches live sports data from external APIs, providing real-time information about games, odds, and statistics.',
      7000
    );

    // Slide 7: Testing Strategy
    await demo.addTalkingPoint(
      '🧪 Testing & Quality Assurance',
      'We\'ve implemented comprehensive testing including unit tests with Jest, database testing, and this E2E demo system.',
      6000
    );

    // Final screenshot
    await demo.takeScreenshot('05-final-demo-state');

    // Slide 8: Conclusion
    await demo.addTalkingPoint(
      '🎯 Demo Conclusion',
      'This concludes our sports betting app demonstration. The app showcases modern React Native development, database integration, and user-centered design.',
      8000
    );

    console.log('\n✅ Demo presentation completed successfully!');
    console.log('📸 Screenshots saved in demo-presentation/screenshots/');
    console.log('🎥 Video recording available in test-results/');
  });

  test('🎮 Interactive Feature Demo', async ({ page }) => {
    const demo = new DemoPresentation(page);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await demo.addTalkingPoint(
      '🎮 Interactive Demo Mode',
      'This is an interactive demo where you can explore the app features at your own pace.',
      5000
    );

    // Add interactive elements highlighting
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        .demo-highlight {
          animation: pulse 2s infinite;
          cursor: pointer !important;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
      `;
      document.head.appendChild(style);
      
      // Highlight interactive elements
      const interactiveElements = document.querySelectorAll('button, input, a, [role="button"]');
      interactiveElements.forEach(el => el.classList.add('demo-highlight'));
    });

    await demo.takeScreenshot('interactive-mode');
    
    await demo.addTalkingPoint(
      '✨ Explore the App',
      'All interactive elements are now highlighted. Click around to explore the different features and sections.',
      10000
    );
  });
});