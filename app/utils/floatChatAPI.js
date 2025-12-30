// API service for FloatChat SQL RAG backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_FLOATCHAT_API_URL || 'http://localhost:7002';

class FloatChatAPI {
  /**
   * Check if the API is healthy
   * @returns {Promise<boolean>} - API health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Send a chat query to the backend
   * @param {string} question - The user's question
   * @param {boolean} debug - Whether to enable debug mode (default: true)
   * @param {string} conversation_id - Conversation ID (optional)
   * @returns {Promise<Object>} - Chat response object
   */
  async sendChatQuery(question, debug = true, conversation_id = null) {
    try {
      const body = {
        question,
        debug,
      };

      if (conversation_id) {
        body.conversation_id = conversation_id;
      }

      const response = await fetch(`${API_BASE_URL}/chat/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error ${response.status}: ${errorData.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data.answer) {
        throw new Error('Invalid response format: missing answer field');
      }

      return {
        answer: data.answer,
        sql: data.sql || null,
        sample: data.sample || null,
        context: data.context || null,
        oversize: data.oversize || false,
        estimated_rows: data.estimated_rows || 0,
        tier: data.tier || null,
        download_url: data.download_url || null,
        conversation_id: data.conversation_id || null,
        hasData: !!(data.sample && data.sample.rows && data.sample.rows.length > 0)
      };
    } catch (error) {
      console.error('Chat query failed:', error);
      
      // Return a user-friendly error response
      return {
        answer: this.getErrorMessage(error),
        sql: null,
        sample: null,
        context: null,
        oversize: false,
        estimated_rows: 0,
        tier: null,
        download_url: null,
        conversation_id: null,
        hasData: false,
        error: true
      };
    }
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - The error object
   * @returns {string} - User-friendly error message
   */
  getErrorMessage(error) {
    if (error.message.includes('fetch')) {
      return "I'm having trouble connecting to the ARGO data service. Please check your internet connection or try again later.";
    }
    
    if (error.message.includes('422')) {
      return "I couldn't understand your question. Could you please rephrase it or be more specific about what ARGO data you're looking for?";
    }
    
    if (error.message.includes('500')) {
      return "The ARGO data service is experiencing issues. Please try again in a few moments.";
    }
    
    return "I encountered an issue while processing your request. Please try asking your question in a different way.";
  }

  /**
   * Get a sample question for users
   * @returns {string} - Sample question
   */
  getSampleQuestion() {
    const samples = [
      "What is the average temperature in the Indian Ocean?",
      "Show me recent salinity data from ARGO floats",
      "How many active floats are deployed currently?",
      "What are the temperature trends in the Pacific Ocean?",
      "Find floats with temperature above 25°C",
      "Show me the deepest measurements recorded",
      "What is the salinity range in the Atlantic Ocean?"
    ];
    
    return samples[Math.floor(Math.random() * samples.length)];
  }
}

// Create a singleton instance
const floatChatAPI = new FloatChatAPI();

export default floatChatAPI;
