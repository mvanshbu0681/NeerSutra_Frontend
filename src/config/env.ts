/**
 * ============================================
 * Environment Configuration
 * Centralized, type-safe environment variables
 * ============================================
 */

/**
 * Environment variable schema
 */
interface EnvConfig {
  // API Configuration
  API_BASE_URL: string;
  
  // Map Services
  GOOGLE_MAPS_API_KEY: string;
  MAPBOX_TOKEN: string;
  
  // Feature Flags
  IS_DEV: boolean;
  IS_PROD: boolean;
  
  // Optional Services
  COPERNICUS_API_KEY?: string;
  ANALYTICS_ID?: string;
}

/**
 * Safely get an environment variable with fallback
 */
function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  return value ?? '';
}

/**
 * Get a required environment variable (warns in dev, throws in prod)
 */
function getRequiredEnvVar(key: string, description: string): string {
  const value = process.env[key];
  
  if (!value) {
    const message = `⚠️ Missing required env var: ${key} (${description})`;
    
    if (process.env.NODE_ENV === 'production') {
      console.error(message);
      // In production, we warn but don't crash to allow graceful degradation
    } else {
      console.warn(message);
    }
    
    return '';
  }
  
  return value;
}

/**
 * Validated environment configuration
 * Import this object instead of using process.env directly
 */
export const ENV: EnvConfig = {
  // API Configuration
  API_BASE_URL: getEnvVar(
    'NEXT_PUBLIC_API_BASE_URL', 
    'http://localhost:3001/api'
  ),
  
  // Map Services
  GOOGLE_MAPS_API_KEY: getRequiredEnvVar(
    'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
    'Google Maps API key for map rendering'
  ),
  
  MAPBOX_TOKEN: getEnvVar(
    'NEXT_PUBLIC_MAPBOX_TOKEN',
    '' // Optional, used as fallback
  ),
  
  // Feature Flags
  IS_DEV: process.env.NODE_ENV === 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  
  // Optional Services
  COPERNICUS_API_KEY: getEnvVar('NEXT_PUBLIC_COPERNICUS_API_KEY'),
  ANALYTICS_ID: getEnvVar('NEXT_PUBLIC_ANALYTICS_ID'),
};

/**
 * Type-safe feature flags
 */
export const FEATURES = {
  /** Enable debug overlays and console logging */
  DEBUG_MODE: ENV.IS_DEV,
  
  /** Enable experimental PFZ features */
  PFZ_ENABLED: true,
  
  /** Enable CHE coastal health engine */
  CHE_ENABLED: true,
  
  /** Enable route optimization */
  ROUTING_ENABLED: true,
  
  /** Use mock data instead of real API calls */
  USE_MOCK_DATA: ENV.IS_DEV || !ENV.API_BASE_URL,
} as const;

/**
 * Map configuration defaults
 */
export const MAP_CONFIG = {
  DEFAULT_CENTER: {
    lat: 12.0,
    lng: 78.0,
  },
  DEFAULT_ZOOM: 5,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  TILE_STYLE: 'satellite' as const,
} as const;

/**
 * Validate critical configuration on module load
 */
if (typeof window !== 'undefined' && ENV.IS_DEV) {
  const missingKeys: string[] = [];
  
  if (!ENV.GOOGLE_MAPS_API_KEY) {
    missingKeys.push('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
  }
  
  if (missingKeys.length > 0) {
    console.warn(
      `🔧 NeerSutra Config: Missing environment variables:\n` +
      missingKeys.map(k => `  - ${k}`).join('\n') +
      `\n\nCreate a .env.local file with these values.`
    );
  }
}

export default ENV;
