// API service for ARGO floater data endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_FLOATER_API_URL || 'http://localhost:3001';

class FloaterAPI {
  /**
   * Get all latest floaters with their coordinates
   * @returns {Promise<Array>} Array of floater summaries
   */
  async getLatestFloaters() {
    try {
      const response = await fetch(`${API_BASE_URL}/latest_floaters`, {
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching latest floaters:', error);
      throw error;
    }
  }

  /**
   * Get available dates for a specific floater
   * @param {number} platformNumber - The platform number
   * @returns {Promise<Array>} Array of available dates
   */
  async getFloaterDates(platformNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/floaters/${platformNumber}/dates`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching dates for floater ${platformNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get latest data for a specific floater
   * @param {number} platformNumber - The platform number
   * @returns {Promise<Object>} Floater data with summary and levels
   */
  async getFloaterLatest(platformNumber) {
    try {
      const response = await fetch(`${API_BASE_URL}/floaters/${platformNumber}/latest`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching latest data for floater ${platformNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get data for a specific floater by date
   * @param {number} platformNumber - The platform number
   * @param {number} dateKey - The date key
   * @returns {Promise<Object>} Floater data with summary and levels
   */
  async getFloaterByDate(platformNumber, dateKey) {
    try {
      const response = await fetch(`${API_BASE_URL}/floaters/${platformNumber}/by-date/${dateKey}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching data for floater ${platformNumber} on date ${dateKey}:`, error);
      throw error;
    }
  }

  /**
   * Get all latest summaries
   * @returns {Promise<Array>} Array of all floater summaries
   */
  async getAllLatestSummaries() {
    try {
      const response = await fetch(`${API_BASE_URL}/floaters/latest_summaries`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching all latest summaries:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const floaterAPI = new FloaterAPI();

export default floaterAPI;
