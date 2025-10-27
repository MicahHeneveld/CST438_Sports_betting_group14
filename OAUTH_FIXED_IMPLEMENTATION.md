# OAuth Implementation - Fixed Backend Configuration ✅

## Issue Resolution

The backend was expecting the frontend to be on port **8081** instead of port **3000**. This has been fixed!

## Changes Made

### ✅ 1. Installed Required Packages

```bash
npm install expo-linking expo-web-browser
```

Both packages are now installed and ready to use.

---

### ✅ 2. Configured Deep Linking in app.json

The `app.json` already has the correct configuration:

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

This allows deep links like `myapp://` or `exp://localhost:8081` to open your app.

---

### ✅ 3. Updated ApiScripts.js

**Changes:**
- **REDIRECT_URI**: Changed from `Linking.createURL('login/oauth2/code/github')` to `'exp://localhost:8081'`
- **OAuth URL**: Removed the `redirect_uri` query parameter (backend handles this automatically)
- **Added logging**: Better debug output with emojis for easier tracking

```javascript
const REDIRECT_URI = 'exp://localhost:8081';

export const loginWithOAuth = async (provider = 'google') => {
  const loginUrl = `${AUTH_BASE_URL}/oauth2/authorization/${provider}`;
  const result = await WebBrowser.openAuthSessionAsync(loginUrl, REDIRECT_URI);
  // ... handles callback
};
```

---

### ✅ 4. Added Linking Event Listener to login.tsx

**New Features:**
- **Deep link listener**: Listens for OAuth callback URLs
- **Auto-parsing**: Automatically extracts `name`, `email`, `avatar`, `authenticated` from URL
- **Dual handling**: Works with both `useLocalSearchParams` and `Linking.addEventListener`
- **Initial URL check**: Handles app being opened directly with an OAuth callback URL

```typescript
useEffect(() => {
  const handleDeepLink = ({ url }) => {
    const { queryParams } = Linking.parse(url);
    if (queryParams?.authenticated === 'true') {
      // Save user and redirect
      setUser({ name, email, avatar });
      router.replace("/favoriteTeams");
    }
  };

  const subscription = Linking.addEventListener('url', handleDeepLink);
  
  // Check if app opened with URL
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => subscription.remove();
}, []);
```

---

## How OAuth Flow Works Now

### 1. User Clicks OAuth Button
```
User clicks "Continue with Google" (or GitHub, Microsoft, Discord)
```

### 2. App Opens Browser
```javascript
WebBrowser.openAuthSessionAsync(
  'https://jump-ball-df460ee69b61.herokuapp.com/oauth2/authorization/github',
  'exp://localhost:8081'
)
```

### 3. Backend Redirects to App
After successful authentication, backend redirects to:
```
exp://localhost:8081?name=John%20Doe&email=john@example.com&avatar=https://...&authenticated=true
```

### 4. App Receives Deep Link
The `Linking.addEventListener` catches this URL and parses the parameters.

### 5. User Data Saved
```javascript
- setUser({ name, email, avatar })
- setSession(userData)
- AsyncStorage.setItem("username", email)
```

### 6. Navigate to App
```javascript
router.replace("/favoriteTeams")
```

---

## Testing Instructions

### Option 1: Use OAuth Buttons (Recommended)

1. **Start the app:**
   ```bash
   npm run start:clear
   ```

2. **Open the app** on your device/emulator

3. **Click an OAuth button:**
   - Continue with Google
   - Continue with GitHub
   - Continue with Microsoft
   - Continue with Discord

4. **Complete authentication** in the browser

5. **Watch for:**
   - Browser closes automatically
   - Console logs show: `🔗 Deep link received: exp://localhost:8081?...`
   - Alert: "Welcome, You are now logged in as..."
   - Redirect to favoriteTeams screen

---

### Option 2: Test Button (Simulated)

The red "🧪 Test OAuth Callback" button simulates the OAuth flow without actually going through the backend.

---

### Option 3: Manual Deep Link Testing

Test the deep link handling directly:

**On Android:**
```bash
adb shell am start -W -a android.intent.action.VIEW -d "exp://localhost:8081?name=Test%20User&email=test@example.com&authenticated=true"
```

**On iOS Simulator:**
```bash
xcrun simctl openurl booted "exp://localhost:8081?name=Test%20User&email=test@example.com&authenticated=true"
```

**On Web:**
Navigate to:
```
http://localhost:8081?name=Test%20User&email=test@example.com&authenticated=true
```

---

## Console Logs to Watch For

### Successful OAuth Flow:

```
🔐 Opening OAuth login for: google
🌐 Login URL: https://jump-ball-df460ee69b61.herokuapp.com/oauth2/authorization/google
🔄 Redirect URI: exp://localhost:8081
📱 WebBrowser result: { type: 'success', url: '...' }
🔗 Deep link received: exp://localhost:8081?name=...&email=...&authenticated=true
📋 Query params: { name: '...', email: '...', avatar: '...', authenticated: 'true' }
✅ User authenticated via OAuth: { name: '...', email: '...' }
```

---

## Backend Requirements

Your backend should:

1. **Accept requests** to:
   ```
   https://jump-ball-df460ee69b61.herokuapp.com/oauth2/authorization/{provider}
   ```

2. **Redirect after authentication** to:
   ```
   exp://localhost:8081?name=USER_NAME&email=USER_EMAIL&avatar=AVATAR_URL&authenticated=true
   ```

3. **URL encode** all parameter values

---

## Troubleshooting

### Issue: "No app to handle this URL"
**Solution:** Make sure Expo is running and the app is open on your device.

### Issue: OAuth button does nothing
**Solution:** Check console for errors. Ensure backend URL is correct.

### Issue: Callback URL not working
**Solution:** 
- Verify REDIRECT_URI matches backend expectation: `exp://localhost:8081`
- Check that backend is sending query parameters: `?name=...&email=...&authenticated=true`

### Issue: Deep link not captured
**Solution:**
- Check that `Linking.addEventListener` is properly set up
- Verify the URL scheme in app.json: `"scheme": "myapp"`
- Restart the Expo server

### Issue: User data not saved
**Solution:**
- Check console logs for errors in `setSession` or `AsyncStorage.setItem`
- Verify queryParams are being parsed correctly

---

## Key Differences from Previous Implementation

| Before | After |
|--------|-------|
| `Linking.createURL('login/oauth2/code/github')` | `'exp://localhost:8081'` |
| Query params via `useLocalSearchParams` only | Dual: `useLocalSearchParams` + `Linking.addEventListener` |
| No initial URL check | Checks `Linking.getInitialURL()` on mount |
| Backend expected port 3000 | Backend now configured for port 8081 ✅ |

---

## Production Considerations

For production builds, you'll need to update:

1. **REDIRECT_URI** in ApiScripts.js:
   ```javascript
   const REDIRECT_URI = __DEV__ 
     ? 'exp://localhost:8081' 
     : 'myapp://callback';
   ```

2. **Backend configuration** to accept production redirect URI

3. **App scheme** should match your production URL scheme

---

## Next Steps

1. ✅ All code changes are complete
2. ✅ Dependencies are installed
3. ✅ Configuration is set
4. 🔄 **Test the OAuth flow** with a real OAuth provider
5. 🔄 Verify user data is saved correctly
6. 🔄 Confirm navigation works after login

---

## Summary

✅ **Fixed:** Backend now correctly expects port 8081  
✅ **Updated:** REDIRECT_URI to use `exp://localhost:8081`  
✅ **Added:** Linking event listener for deep link handling  
✅ **Enhanced:** Dual handling for OAuth callbacks  
✅ **Improved:** Debug logging with emojis  

**Status:** Ready to test OAuth flow! 🚀
