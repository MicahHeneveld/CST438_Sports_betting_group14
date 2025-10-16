const { exec } = require('child_process');
const readline = require('readline');

class PresentationController {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('\n🎯 Sports Betting App - Demo Presentation Controller');
    console.log('=' .repeat(60));
    console.log('📋 Available Demo Options:');
    console.log('1. 🎬 Full Auto Demo (with talking points)');
    console.log('2. 🎮 Interactive Demo Mode');
    console.log('3. 🎯 Custom Demo (select features)');
    console.log('4. 📸 Screenshot Mode Only');
    console.log('=' .repeat(60));

    const choice = await this.askQuestion('\n🎤 Select demo type (1-4): ');
    
    switch(choice) {
      case '1':
        await this.runFullDemo();
        break;
      case '2':
        await this.runInteractiveDemo();
        break;
      case '3':
        await this.runCustomDemo();
        break;
      case '4':
        await this.runScreenshotMode();
        break;
      default:
        console.log('❌ Invalid choice. Running full demo...');
        await this.runFullDemo();
    }
    
    this.rl.close();
  }

  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  async runFullDemo() {
    console.log('\n🚀 Starting Full Auto Demo...');
    console.log('💡 Tip: Watch the browser and follow the talking points!');
    
    const startApp = await this.askQuestion('\n🔄 Start the Expo web server first? (y/n): ');
    if (startApp.toLowerCase() === 'y') {
      console.log('🌐 Starting Expo web server...');
      exec('npm run web', (error, stdout, stderr) => {
        if (error) console.log('Web server error:', error.message);
      });
      
      await this.askQuestion('⏳ Press ENTER when the web server is running (usually at http://localhost:19006)...');
    }

    console.log('\n🎬 Launching demo presentation...');
    exec('npx playwright test demo-presentation/demo.spec.js --project=chromium --headed', (error, stdout, stderr) => {
      if (error) {
        console.log('Demo error:', error.message);
        return;
      }
      console.log('Demo output:', stdout);
    });
  }

  async runInteractiveDemo() {
    console.log('\n🎮 Starting Interactive Demo...');
    exec('npx playwright test demo-presentation/demo.spec.js --project=chromium --headed --grep "Interactive"', (error, stdout, stderr) => {
      if (error) {
        console.log('Demo error:', error.message);
        return;
      }
      console.log('Demo output:', stdout);
    });
  }

  async runCustomDemo() {
    console.log('\n🎯 Custom Demo Options:');
    console.log('1. Authentication Flow Only');
    console.log('2. Navigation Demo Only');
    console.log('3. Database Features Only');
    console.log('4. API Integration Demo');
    
    const feature = await this.askQuestion('Select feature to demo (1-4): ');
    
    // You can extend this to run specific parts of the demo
    console.log(`🎬 Running demo for feature ${feature}...`);
    exec('npx playwright test demo-presentation/demo.spec.js --project=chromium --headed', (error, stdout, stderr) => {
      if (error) {
        console.log('Demo error:', error.message);
        return;
      }
      console.log('Demo output:', stdout);
    });
  }

  async runScreenshotMode() {
    console.log('\n📸 Screenshot Mode - Taking snapshots of all app screens...');
    exec('npx playwright test demo-presentation/demo.spec.js --project=chromium --reporter=null', (error, stdout, stderr) => {
      if (error) {
        console.log('Screenshot error:', error.message);
        return;
      }
      console.log('✅ Screenshots saved to demo-presentation/screenshots/');
    });
  }
}

// Start the presentation controller
const controller = new PresentationController();
controller.start().catch(console.error);