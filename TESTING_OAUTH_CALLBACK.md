# Testing OAuth Callback Implementation

## ✅ Setup Complete

Your app is now ready to test the OAuth callback feature! I've fixed the Node.js error and added a test button.

## Quick Start

### 1. Start the App
```bash
npm run start:clear
```

This will start Expo with the proper Node.js configuration to avoid TypeScript type-stripping errors.

### 2. Open the App
- Scan the QR code with Expo Go on your phone
- Or press `a` for Android emulator
- Or press `i` for iOS simulator
- Or press `w` for web

## Testing Methods

### **Method 1: Test Button (Easiest)**

I've added a red "🧪 Test OAuth Callback" button at the bottom of your login screen.

**Steps:**
1. Open the app and navigate to the login screen
2. Scroll to the bottom
3. Click the "🧪 Test OAuth Callback" button
4. You should see:
   - Console log: `OAuth callback detected: { name, email, avatar }`
   - Alert: "Welcome, You are now logged in as Test User!"
   - Automatic redirect to `/favoriteTeams`

**Expected behavior:**
- User data is saved to state and AsyncStorage
- Username stored: `testuser@example.com`
- Redirects to favorite teams screen

---

### **Method 2: Manual URL Navigation (Programmatic)**

From anywhere in your app, you can trigger the OAuth callback:

```javascript
import { router } from 'expo-router';

router.push({
  pathname: '/login',
  params: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    authenticated: 'true'
  }
});
```

---

### **Method 3: Deep Linking (Real OAuth Flow)**

For testing with your actual OAuth backend:

1. **Configure your backend** to redirect to:
   ```
   exp://YOUR_LOCAL_IP:8081/--/login?name=USER_NAME&email=USER_EMAIL&avatar=AVATAR_URL&authenticated=true
   ```

2. **Test the deep link** in development:
   ```bash
   # On Android
   adb shell am start -W -a android.intent.action.VIEW -d "exp://192.168.1.100:8081/--/login?name=John%20Doe&email=john@example.com&authenticated=true"
   
   # On iOS Simulator
   xcrun simctl openurl booted "exp://192.168.1.100:8081/--/login?name=John%20Doe&email=john@example.com&authenticated=true"
   ```

Replace `192.168.1.100` with your computer's IP address (shown in Expo Metro).

---

### **Method 4: Browser Testing (Web Only)**

If testing on web:

1. Open: `http://localhost:8081`
2. Navigate to login
3. Manually change URL to:
   ```
   http://localhost:8081/login?name=Test%20User&email=test@example.com&authenticated=true
   ```

---

## What to Check

### Console Logs
Open your browser console or run `npx react-native log-android` / `npx react-native log-ios`:

```
OAuth callback detected: {
  name: 'Test User',
  email: 'testuser@example.com',
  avatar: 'https://i.pravatar.cc/150?img=3'
}
```

### AsyncStorage
Check if data is persisted:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check stored username
const username = await AsyncStorage.getItem('username');
console.log('Stored username:', username);

// Check session data
const session = await AsyncStorage.getItem('@user_session');
console.log('Session data:', JSON.parse(session));
```

### State
Add this to your component to see the user state:

```javascript
console.log('User state:', user);
```

---

## Troubleshooting

### Issue: App doesn't redirect after clicking test button
**Solution:** Check the console for errors. Make sure `favoriteTeams` route exists.

### Issue: Alert doesn't show
**Solution:** The setTimeout may be too fast. Check the console logs instead.

### Issue: Parameters not being captured
**Solution:** Make sure you're using `useLocalSearchParams()` from `expo-router`.

### Issue: Can't find test button
**Solution:** Scroll to the bottom of the login screen. The button is after the OAuth login buttons.

---

## Production Backend Requirements

When deploying, your OAuth backend should redirect to:

```
yourapp://login?name=USER_NAME&email=USER_EMAIL&avatar=AVATAR_URL&authenticated=true
```

Where `yourapp://` is your app's custom scheme defined in `app.json`:

```json
{
  "expo": {
    "scheme": "yourapp"
  }
}
```

---

## Next Steps

1. ✅ Test with the test button
2. ✅ Verify data in console logs
3. ✅ Check AsyncStorage persistence
4. ✅ Test navigation flow
5. ⬜ Configure your backend OAuth redirect
6. ⬜ Test with real OAuth providers
7. ⬜ Remove test button before production

---

## Remove Test Button

Once testing is complete, remove the test button section from `login.tsx`:

```tsx
{/* Test OAuth Callback Button */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Test OAuth Callback</Text>
  <TouchableOpacity
    style={[styles.oauthButton, { backgroundColor: "#FF6B6B" }]}
    onPress={() => {
      // ... test code
    }}
  >
    <Text style={styles.oauthButtonText}>🧪 Test OAuth Callback</Text>
  </TouchableOpacity>
</View>
```

---

## Summary

✅ **Fixed:** Node.js TypeScript type-stripping error  
✅ **Added:** Test button for easy OAuth callback testing  
✅ **Configured:** OAuth parameter handling in login screen  
✅ **Ready:** App can receive and process OAuth callbacks  

**Status:** Ready to test! 🚀
