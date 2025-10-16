# 🎯 Sports Betting App - Demo Presentation System

This automated demo presentation system allows you to showcase your sports betting app with professional talking points and automated navigation.

## 🚀 Quick Start

### 1. Start the Demo Controller
```bash
npm run demo
```

### 2. Or Run Specific Demo Types
```bash
# Full automated demo with talking points
npm run demo:auto

# Interactive exploration mode
npm run demo:interactive

# Screenshots only mode
npm run demo:screenshots

# Regular E2E tests
npm run e2e
```

## 🎬 Demo Features

### 📋 Full Auto Demo
- **Duration**: ~5-8 minutes
- **Features**: Automated navigation with timed talking points
- **Best for**: Live presentations, client demos
- **Output**: Screenshots + video recording

### 🎮 Interactive Demo
- **Duration**: User-controlled
- **Features**: Highlights interactive elements, explore at your own pace
- **Best for**: Q&A sessions, detailed walkthroughs

### 📸 Screenshot Mode
- **Duration**: ~2 minutes
- **Features**: Captures high-quality screenshots of all app screens
- **Best for**: Documentation, slide creation

## 🎤 Talking Points System

The demo automatically pauses at key moments and displays talking points:

- **🏆 App Introduction** - Overview of the sports betting platform
- **🔐 Authentication** - User login and account creation
- **🧭 Navigation** - React Navigation implementation
- **🗄️ Database** - SQLite integration and data management
- **⚽ Team Selection** - Favorite teams and user preferences
- **🌐 API Integration** - Live sports data fetching
- **🧪 Testing Strategy** - Quality assurance approach

## 📁 File Structure

```
demo-presentation/
├── demo.spec.js              # Main demo test script
├── presentation-controller.js # Interactive controller
├── screenshots/              # Generated screenshots
└── README.md                # This file
```

## 🛠️ Customization

### Adding New Talking Points
```javascript
await demo.addTalkingPoint(
  '🎯 Your Title',
  'Your detailed explanation here...',
  5000  // Duration in milliseconds
);
```

### Custom Screenshots
```javascript
await demo.takeScreenshot('my-feature-name');
```

### Highlighting Elements
```javascript
await demo.highlight('button.login-btn', '#00ff00');
```

## 🎥 Recording Options

- **Video**: Automatically recorded during demo
- **Screenshots**: Saved to `demo-presentation/screenshots/`
- **Live Stream**: Can be used with OBS or similar tools

## 💡 Presentation Tips

1. **Pre-Demo Setup**:
   - Start Expo web server (`npm run web`)
   - Test your talking points
   - Prepare for Q&A segments

2. **During Demo**:
   - Follow the talking point prompts
   - Use pauses for audience questions
   - Screenshot mode for backup slides

3. **Post-Demo**:
   - Screenshots available immediately
   - Video recordings in `test-results/`
   - Share demo folder for reference

## 🔧 Technical Requirements

- Node.js 16+
- Expo CLI
- Playwright browsers installed
- Web browser (Chrome recommended)

## 🚨 Troubleshooting

### Demo Won't Start
```bash
# Install Playwright browsers
npx playwright install

# Start web server manually
npm run web
```

### Missing Screenshots
- Check `demo-presentation/screenshots/` folder
- Ensure proper file permissions
- Run in non-headless mode

### Talking Points Not Showing
- Verify browser allows overlays
- Check console for JavaScript errors
- Use Chrome for best compatibility

## 🎯 Next Steps

- Customize talking points for your audience
- Add more interactive elements
- Create theme-specific demos (mobile vs desktop)
- Integrate with presentation software

---

**Happy Presenting! 🎉**