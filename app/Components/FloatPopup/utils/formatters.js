/**
 * Utility functions for formatting data in the Float Popup
 */

/**
 * Format latitude and longitude coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string} Formatted coordinates
 */
export const formatLatLon = (lat, lon) => {
  if (lat === null || lon === null || lat === undefined || lon === undefined) {
    return '—, —';
  }
  
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lonDirection = lon >= 0 ? 'E' : 'W';
  
  const formattedLat = Math.abs(lat).toFixed(3);
  const formattedLon = Math.abs(lon).toFixed(3);
  
  return `${formattedLat}°${latDirection}, ${formattedLon}°${lonDirection}`;
};

/**
 * Format date from ISO string
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date (DD.MM.YYYY)
 */
export const formatDate = (isoString) => {
  if (!isoString) return '—';
  
  try {
    const date = new Date(isoString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    
    return `${day}.${month}.${year}`;
  } catch {
    return '—';
  }
};

/**
 * Format time from ISO string
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted time (HH:MM)
 */
export const formatTime = (isoString) => {
  if (!isoString) return '—';
  
  try {
    const date = new Date(isoString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch {
    return '—';
  }
};

/**
 * Format numbers with specified decimal places using Intl.NumberFormat
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false // Disable thousands separator for cleaner look
  }).format(value);
};

/**
 * Generate mock level data for demo purposes
 * @param {number} count - Number of levels to generate
 * @returns {Array} Array of level objects
 */
export const generateMockLevels = (count = 100) => {
  const levels = [];
  
  for (let i = 0; i < count; i++) {
    const depth = i;
    
    // Simulate temperature decay with depth (warmer at surface)
    const baseTemp = 25 - (depth * 0.02) + Math.sin(depth * 0.1) * 2;
    const temp = Math.max(2, baseTemp + (Math.random() - 0.5) * 0.5);
    
    // Simulate salinity variation
    const baseSal = 34.5 + Math.sin(depth * 0.05) * 0.5;
    const sal = baseSal + (Math.random() - 0.5) * 0.2;
    
    // Psal typically close to sal but can vary slightly
    const psal = sal + (Math.random() - 0.5) * 0.1;
    
    levels.push({
      depth_m: depth,
      temp_c: Number(temp.toFixed(1)),
      sal: Number(sal.toFixed(2)),
      psal: Number(psal.toFixed(2))
    });
  }
  
  return levels;
};
