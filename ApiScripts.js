import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';

// Initialize web browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Backend API URLs
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://jump-ball-df460ee69b61.herokuapp.com/api';
const AUTH_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'https://jump-ball-df460ee69b61.herokuapp.com';
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 AUTH_BASE_URL:', AUTH_BASE_URL);
const SESSION_KEY = '@user_session';

// OAuth redirect URI for mobile - updated to match backend expectation
import * as Linking from 'expo-linking';

const REDIRECT_URI = 'exp://localhost:8081';
console.log('🔧 REDIRECT_URI:', REDIRECT_URI);


// Store user session data
export const setSession = async (sessionData) => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error('Error storing session:', error);
    return false;
  }
};

// Get stored session data
export const getSession = async () => {
  try {
    const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Clear session data (logout)
export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing session:', error);
    return false;
  }
};

// OAuth login function
export const loginWithOAuth = async (provider = 'google') => {
  try {
    console.log('🔐 Opening OAuth login for:', provider);

    // Build OAuth login URL - backend expects redirect_uri parameter
    const loginUrl = `${AUTH_BASE_URL}/oauth2/authorization/${provider}`;

    console.log('🌐 Login URL:', loginUrl);
    console.log('🔄 Redirect URI:', REDIRECT_URI);

    // Open browser for OAuth - backend will redirect to exp://localhost:8081
    const result = await WebBrowser.openAuthSessionAsync(loginUrl, REDIRECT_URI);

    console.log('📱 WebBrowser result:', result);

 
    if (result.type === 'success' && result.url) {
      // Extract parameters from URL
      const urlParams = new URLSearchParams(result.url.split('?')[1]);
      const token = urlParams.get('token');
      const name = urlParams.get('name');
      const email = urlParams.get('email');
      const avatar = urlParams.get('avatar');
      const authenticated = urlParams.get('authenticated');

      // Check if OAuth callback contains user data
      if (authenticated === 'true' && (name || email)) {
        console.log('✅ OAuth callback with user data:', { name, email, avatar });
        const userData = { name, email, avatar };
        await setSession(userData);
        await AsyncStorage.setItem('username', email || name || 'oauth_user');
        return true;
      }

      if (token) {
        // Store token if found
        console.log('✅ Received token:', token);
        await AsyncStorage.setItem('access_token', token);
        await setSession({ token });
        return true;
      } else {
        // Fallback to cookie-based session
        const authenticatedStatus = await checkAuthStatus();
        if (authenticatedStatus) {
          console.log('✅ Logged in with backend session (cookies)');
          return true;
        }
      }
    }

    console.log('OAuth login failed or cancelled');
    return false;
  } catch (error) {
    console.error('OAuth login error:', error);
    return false;
  }
};

// Check if user is authenticated
export const checkAuthStatus = async () => {
  try {
    console.log(' Checking auth status...');

    // Call backend user endpoint
    const response = await fetch(`${AUTH_BASE_URL}/api/user`, {
      method: 'GET',
      credentials: 'include', // Send cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Auth check response status:', response.status);

    // If response is OK and JSON
    if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
      const userData = await response.json();
      console.log(' User authenticated:', userData);
      await setSession(userData);
      return true;
    }

    console.log('Not authenticated');
    return false;
  } catch (error) {
    console.error('Auth status check failed:', error);
    return false;
  }
};

// Check if user has valid session
export const isAuthenticated = async () => {
  const session = await getSession();
  if (session) {
    return await checkAuthStatus();
  }
  return false;
};

// Logout user
export const logout = async () => {
  try {
    // Call backend logout
    await fetch(`${AUTH_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    await clearSession();
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    await clearSession();
    return false;
  }
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Send cookies
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Handle auth errors
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication failed, clearing session');
      await clearSession();
      throw new Error('AUTHENTICATION_REQUIRED');
    }


    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    // Verify response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response not JSON');
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// Get all teams
export const callTeams = async () => {
  try {
    const json = await apiCall('/teams/all'); 
    if (!json || json.length === 0) return [];

    return json.map((team) => ({
      id: team.id,
      name: team.name,
      nickname: team.nickname,
      logo: team.logo,
    }));
  } catch (error) {
    console.error('Error fetching teams:', error);
    if (error.message === 'AUTHENTICATION_REQUIRED') throw error;
    return [];
  }
};

// Get all games
export const callGames = async () => {
  try {
    const json = await apiCall('/games'); 
    if (!json || json.length === 0) return [];

    return json.map((game) => ({
      id: game.id,
      gameDate: game.gameDateEst,
      homeTeamId: game.homeTeamId,
      awayTeamId: game.awayTeamId,
      homeTeamScore: game.homeTeamScore,
      awayTeamScore: game.awayTeamScore,
    }));
  } catch (error) {
    console.error('Error fetching games:', error);
    if (error.message === 'AUTHENTICATION_REQUIRED') throw error;
    return [];
  }
};
