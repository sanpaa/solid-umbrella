/**
 * Authentication Utilities
 * 
 * Provides helper functions for authentication and authorization.
 */

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export function isAuthenticated() {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  return !!token;
}

/**
 * Get current user from localStorage
 * @returns {object|null} User object or null
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Get authentication token
 * @returns {string|null} Token or null
 */
export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Get refresh token
 * @returns {string|null} Refresh token or null
 */
export function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

/**
 * Save authentication data
 * @param {string} token - Access token
 * @param {string} refreshToken - Refresh token
 * @param {object} user - User object
 */
export function saveAuthData(token, refreshToken, user) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear authentication data
 */
export function clearAuthData() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Logout user
 */
export function logout() {
  clearAuthData();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}
