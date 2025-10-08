# Welcome to our basketball betting app 🏀

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

## Database Configuration (JawsDB/Heroku Ready)

This app is configured to work with JawsDB MySQL on Heroku. The database layer (`database/db.js`) uses HTTP API calls instead of local SQLite to ensure compatibility across all platforms.

### Development Mode
- The app runs with mock data when no backend is connected
- All database functions return sensible defaults for testing
- No errors occur when the API endpoint is unavailable

### Production Setup (When Ready)
1. Copy `.env.example` to `.env`
2. Update `EXPO_PUBLIC_API_URL` with your Heroku app URL:
   ```
   EXPO_PUBLIC_API_URL=https://your-heroku-app.herokuapp.com/api
   ```
3. Deploy your backend to Heroku with JawsDB MySQL addon
4. The app will automatically switch from mock data to real API calls

### API Endpoints Expected
Your Heroku backend should implement these endpoints:
- `GET /health` - Health check
- `POST /users` - Create user
- `POST /auth/login` - User login
- `GET /users/check/:username` - Check username availability
- `GET /users/:username` - Get user details
- `POST /auth/change-password` - Update password
- `POST /favorites` - Add team to favorites
- `DELETE /favorites/:username/:teamName` - Remove favorite
- `GET /favorites/:username` - Get user's favorite teams
- `GET /teams` - Get all teams

This architecture solves the SQLite/WASM compatibility issues and makes the app deployment-ready for Heroku.
