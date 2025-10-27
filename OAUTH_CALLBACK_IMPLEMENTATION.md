# OAuth Callback Implementation

## Changes Made

### 1. Updated `app/(tabs)/login.tsx`

Added OAuth callback parameter handling:

- **Imported `useLocalSearchParams`** from `expo-router` to access URL query parameters
- **Added user state** to store OAuth user information (name, email, avatar)
- **Added OAuth callback detection** in the `useEffect` hook that checks for:
  - `authenticated=true` parameter
  - User data parameters: `name`, `email`, `avatar`
- **Automatic login flow** when OAuth callback is detected:
  - Extracts user data from URL parameters
  - Saves user data to state using `setUser()`
  - Saves user data to AsyncStorage/session
  - Shows welcome message
  - Redirects to `/favoriteTeams`

### 2. Updated `ApiScripts.js`

Enhanced OAuth callback handling in the `loginWithOAuth` function:

- **Extract user data from URL** parameters including:
  - `name` - User's display name
  - `email` - User's email address
  - `avatar` - User's profile picture URL
  - `authenticated` - Authentication status flag
- **Priority checking**:
  1. First checks for `authenticated=true` with user data (name/email)
  2. Then checks for token-based authentication
  3. Falls back to cookie-based session
- **Improved logging** with ✅ emojis for successful authentication

## How It Works

When a user completes OAuth login on your backend:

1. Backend redirects to: `yourapp://login?name=John&email=john@example.com&avatar=https://...&authenticated=true`
2. `login.tsx` detects these parameters via `useLocalSearchParams()`
3. User data is extracted and saved to:
   - Component state (`setUser`)
   - AsyncStorage/session (`setSession`)
   - Username in AsyncStorage
4. User is automatically redirected to the favoriteTeams screen

## Backend Requirements

Your OAuth backend should redirect to the mobile app with these query parameters:

```
yourapp://login?name=USER_NAME&email=USER_EMAIL&avatar=AVATAR_URL&authenticated=true
```

Example:
```
yourapp://login?name=John%20Doe&email=john@example.com&avatar=https://example.com/avatar.jpg&authenticated=true
```

## Testing

To test the OAuth callback locally, you can navigate to the login screen with parameters:

```javascript
router.push({
  pathname: '/login',
  params: {
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.jpg',
    authenticated: 'true'
  }
});
```

## Notes

- Parameters are automatically handled by Expo Router's deep linking
- The code handles both array and string parameter types (in case of duplicate params)
- User data is persisted across app restarts via AsyncStorage
- The implementation is compatible with your existing OAuth flow
