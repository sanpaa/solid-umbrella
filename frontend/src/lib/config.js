/**
 * Application Configuration
 * 
 * Centralizes all environment variables with fallback values.
 * This prevents undefined values in production builds.
 */

// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// App Configuration
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Sistema de Gestão de Serviços';
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

// Features
export const ENABLE_PWA = process.env.NEXT_PUBLIC_ENABLE_PWA === 'true';
export const ENABLE_OFFLINE = process.env.NEXT_PUBLIC_ENABLE_OFFLINE === 'true';

// File Upload
export const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760', 10);
export const ALLOWED_FILE_TYPES = process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf';

// Google Maps
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Export config object
const config = {
  API_URL,
  APP_NAME,
  APP_VERSION,
  ENABLE_PWA,
  ENABLE_OFFLINE,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  GOOGLE_MAPS_API_KEY,
};

export default config;
