import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const transcriptionService = {
  // Get user's transcription history
  getHistory: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/transcribe/history?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // Get single transcription
  getTranscription: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/transcribe/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transcription:', error);
      throw error;
    }
  },

  // Delete transcription
  deleteTranscription: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/transcribe/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transcription:', error);
      throw error;
    }
  }
};