import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format coordinates for display
 */
export function formatCoordinate(value: number, type: 'lat' | 'lon'): string {
  const direction = type === 'lat' 
    ? (value >= 0 ? 'N' : 'S')
    : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(4)}° ${direction}`;
}

/**
 * Format speed in knots
 */
export function formatSpeed(knots: number): string {
  return `${knots.toFixed(1)} kn`;
}

/**
 * Format distance in nautical miles
 */
export function formatDistance(nm: number): string {
  return `${nm.toFixed(1)} NM`;
}

/**
 * Format fuel consumption
 */
export function formatFuel(tonnes: number): string {
  return `${tonnes.toFixed(2)} t`;
}

/**
 * Format CO2 emissions
 */
export function formatCO2(tonnes: number): string {
  return `${tonnes.toFixed(2)} t CO₂`;
}

/**
 * Format time duration
 */
export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

/**
 * Format ISO timestamp to display time
 */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format ISO timestamp to display date
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Interpolate between two values based on time
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Calculate bearing between two points
 */
export function calculateBearing(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

/**
 * Calculate distance between two points (Haversine)
 */
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 3440.065; // Earth radius in nautical miles
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
