import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Add axios interceptor to include auth token automatically
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const transcriptionService = {
  // Get user's transcription history with search only
  getHistory: async (page = 1, limit = 10, search = '') => {
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString()
      };

      // Add search parameter if provided
      if (search && search.trim() !== '') {
        params.search = search.trim();
      }

      const response = await axios.get(`${API_BASE_URL}/api/transcribe/history`, {
        params: params
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch history');
    }
  },

  getTranscription: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transcribe/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transcription:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch transcription');
    }
  },

  deleteTranscription: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/transcribe/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transcription:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete transcription');
    }
  }
};