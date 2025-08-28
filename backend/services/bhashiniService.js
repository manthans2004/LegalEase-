// services/bhashiniService.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class BhashiniService {
  constructor() {
    // TODO: 1. Get these values from your Bhashini Dashboard
    this.apiKey = process.env.BHASHINI_API_KEY; // Your API Key from .env
    this.userId = process.env.BHASHINI_USER_ID;  // Often required, get from dashboard
    this.baseURL = 'https://meity-auth.ulcacontrib.org/asr/inference'; // TODO: 2. Confirm the correct API Endpoint URL
  }

  async transcribeAudio(filePath, languageCode = 'en') {
    console.log('🔄 Starting real Bhashini API transcription...');

    try {
      // Prepare the audio file for upload
      const formData = new FormData();
      const audioFile = fs.createReadStream(filePath); // Read the saved file

      // TODO: 3. Append the file with the exact parameter name Bhashini expects (e.g., 'audio', 'file', 'content')
      formData.append('audio', audioFile); // 'audio' might be 'file' or 'content' - check docs!

      // TODO: 4. Append any other required parameters (e.g., language, model, userId)
      // These are example parameters. YOU MUST CHECK THE OFFICIAL DOCS.
      formData.append('language', languageCode);
      formData.append('userId', this.userId);

      // Make the API request to Bhashini
      const response = await axios.post(this.baseURL, formData, {
        headers: {
          // Headers are critical. Auth is often done with the API Key in a header.
          'Authorization': `Bearer ${this.apiKey}`,
          // Axios will automatically set the correct 'Content-Type' for FormData
          ...formData.getHeaders(), // This adds the proper multipart form boundary
        },
        // Optional: increase timeout since transcription can take a moment
        timeout: 30000, // 30 seconds
      });

      console.log('✅ Bhashini API response received:', response.data);

      // TODO: 5. Extract the transcribed text from the response.
      // The structure of the response JSON is crucial. Check the docs!
      // Example: return response.data.output[0].source;
      const transcribedText = response.data?.transcribedText || 'Text not found in response'; // PLACEHOLDER
      return transcribedText;

    } catch (error) {
      console.error('❌ Bhashini API Error:');
      console.error('   - Message:', error.message);

      // More detailed error logging for debugging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('   - Status:', error.response.status);
        console.error('   - Data:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('   - No response received');
      }
      // Throw the error so the route can catch it and update the DB status to 'failed'
      throw new Error(`Bhashini transcription failed: ${error.message}`);
    }
  }
}

module.exports = new BhashiniService();