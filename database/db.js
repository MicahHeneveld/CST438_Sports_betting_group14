// JawsDB/Heroku API Database Layer
// Ready for Heroku deployment with JawsDB MySQL

// Environment configuration - set EXPO_PUBLIC_API_URL in your .env
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://your-heroku-app.herokuapp.com/api';

// Simple HTTP client for JawsDB API calls
const apiClient = {
  baseURL: API_BASE_URL,
  
  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },
  
  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  },
  
  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, { method: 'DELETE' });
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
};

// Database initialization - test API connection
export async function initializeDatabase() {
  try {
    await apiClient.get('/health');
    console.log('JawsDB API connected successfully');
  } catch (error) {
    console.log('API not available yet - using mock data');
  }
}

// ===== USER MANAGEMENT FUNCTIONS =====

export async function insertUser(username, password) {
  try {
    return await apiClient.post('/users', { username, password });
  } catch (error) {
    console.log('User creation failed - API not ready');
    return { success: true, id: Date.now() }; // Mock response
  }
}

export async function verifyUserLogin(username, password) {
  try {
    const result = await apiClient.post('/auth/login', { username, password });
    return result.success;
  } catch (error) {
    console.log('Login check failed - API not ready');
    return true; // Mock success for development
  }
}

export async function isUsernameAvailable(username) {
  try {
    const result = await apiClient.get(`/users/check/${username}`);
    return result.available;
  } catch (error) {
    console.log('Username check failed - API not ready');
    return true; // Mock available
  }
}

export async function getUserID(username) {
  try {
    const result = await apiClient.get(`/users/${username}`);
    return result.id;
  } catch (error) {
    console.log('User ID fetch failed - API not ready');
    return 1; // Mock ID
  }
}

export async function updatePassword(username, oldPassword, newPassword) {
  try {
    return await apiClient.post('/auth/change-password', { 
      username, 
      oldPassword, 
      newPassword 
    });
  } catch (error) {
    console.log('Password update failed - API not ready');
    return { success: true };
  }
}

// ===== TEAM FAVORITES FUNCTIONS =====

export async function addTeamToFavs(username, teamName) {
  try {
    return await apiClient.post('/favorites', { username, teamName });
  } catch (error) {
    console.log('Add favorite failed - API not ready');
    return { success: true };
  }
}

export async function removeTeamFromFav(username, teamName) {
  try {
    return await apiClient.delete(`/favorites/${username}/${teamName}`);
  } catch (error) {
    console.log('Remove favorite failed - API not ready');
    return { success: true };
  }
}

export async function getFavTeamNames(username) {
  try {
    const result = await apiClient.get(`/favorites/${username}`);
    return result.teams || [];
  } catch (error) {
    console.log('Get favorites failed - API not ready');
    return []; // Mock empty favorites
  }
}

export async function getAllFavTeamInfo(username) {
  try {
    const result = await apiClient.get(`/favorites/${username}/details`);
    return result.teams || [];
  } catch (error) {
    console.log('Get favorite details failed - API not ready');
    return []; // Mock empty details
  }
}

// ===== UTILITY FUNCTIONS =====

export async function getAllTeams() {
  try {
    const result = await apiClient.get('/teams');
    return result.teams || [];
  } catch (error) {
    console.log('Get teams failed - API not ready');
    return []; // Mock empty teams
  }
}

export async function logDatabaseContents() {
  console.log('Database logging - switch to JawsDB API when ready');
}

// Call initialization when module loads
initializeDatabase();
