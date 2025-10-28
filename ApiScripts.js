import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Initialize web browser for OAuth
WebBrowser.maybeCompleteAuthSession();


const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://jump-ball-df460ee69b61.herokuapp.com/api';
const AUTH_BASE_URL = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'https://jump-ball-df460ee69b61.herokuapp.com';
const SESSION_KEY = '@user_session';
const REDIRECT_URI = 'exp://localhost:8081';

console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 AUTH_BASE_URL:', AUTH_BASE_URL);
console.log('🔧 REDIRECT_URI:', REDIRECT_URI);


export const setSession = async (sessionData) => {
  try {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    return true;
  } catch (error) {
    console.error('Error storing session:', error);
    return false;
  }
};

export const getSession = async () => {
  try {
    const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
    return sessionJson ? JSON.parse(sessionJson) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing session:', error);
    return false;
  }
};


export const loginWithOAuth = async (provider = 'github') => {
  try {
    console.log('🔐 Opening OAuth login for:', provider);

    const loginUrl = `${AUTH_BASE_URL}/oauth2/authorization/${provider}`;
    console.log('🌐 Login URL:', loginUrl);
    console.log('🔄 Redirect URI:', REDIRECT_URI);

    const result = await WebBrowser.openAuthSessionAsync(loginUrl, REDIRECT_URI);
    console.log('📱 WebBrowser result:', result);

    if (result.type === 'success' && result.url) {
      const urlParams = new URLSearchParams(result.url.split('?')[1]);
      const token = urlParams.get('token');
      const name = urlParams.get('name');
      const email = urlParams.get('email');
      const avatar = urlParams.get('avatar');
      const authenticated = urlParams.get('authenticated');

      if (authenticated === 'true' && (name || email)) {
        console.log('OAuth callback with user data:', { name, email, avatar });
        const userData = { name, email, avatar };
        await setSession(userData);
        await AsyncStorage.setItem('username', email || name || 'oauth_user');
      }

      if (token) {
        console.log('Received token:', token);
        await AsyncStorage.setItem('access_token', token);
        await setSession({ token });
        return true;
      } else {
        const authenticatedStatus = await checkAuthStatus();
        if (authenticatedStatus) {
          console.log('Logged in with backend session (cookies)');
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


export const checkAuthStatus = async () => {
  try {
    console.log(' Checking auth status...');
    const response = await fetch(`${AUTH_BASE_URL}/api/user`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('Auth check response status:', response.status);

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


export const logout = async () => {
  try {
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

export const apiCall = async (endpoint, options = {}) => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    const url = `${API_BASE_URL}${endpoint}`;

   

    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ HTTP ${response.status}:`, text.substring(0, 200));
      throw new Error(`HTTP error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Response not JSON. Server said:\n', text.substring(0, 200));
      throw new Error('Response not JSON');
    }

    const data = await response.json();

    return data;
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

    return json.map((team) => {
      // Default NBA PNG logo path
      const nbaLogo = `https://cdn.nba.com/logos/nba/${team.teamId}/primary/L/logo.png`;

      // Some non-NBA teams don’t have CDN logos — add generic fallback
      const fallbackLogo = 'https://upload.wikimedia.org/wikipedia/commons/0/0e/NBA_logo.svg';

      return {
        id: team.teamId.toString(),
        name: team.teamName ?? "Unknown",
        city: team.teamCity ?? "",
        logo:
          team.logo && team.logo !== "null"
            ? team.logo
            : team.teamId >= 1610612737 && team.teamId <= 1610612766 // NBA ID range
            ? nbaLogo
            : fallbackLogo, // generic logo for intl / missing teams
      };

      
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
};



// Get all games
export const callGames = async () => {
  try {
    const json = await apiCall('/games/all');
    const gamesArray = Array.isArray(json) ? json : json.games || [];

    if (gamesArray.length === 0) return [];

    return gamesArray.map((game) => ({
      id: game.gameId,
      gameDate: game.gameDateUTC,
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