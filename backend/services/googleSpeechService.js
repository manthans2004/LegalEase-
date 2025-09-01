const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');

class GoogleSpeechService {
  constructor() {
    try {
      // Manual credentials loading
      const credentialsPath = path.resolve(__dirname, '../google-credentials.json');
      
      if (!fs.existsSync(credentialsPath)) {
        throw new Error(`Credentials file not found at: ${credentialsPath}`);
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      this.client = new speech.SpeechClient({
        credentials: credentials,
        projectId: credentials.project_id
      });
      
      console.log('✅ Google Speech client initialized with manual credentials');
      console.log('📋 Project ID:', credentials.project_id);

    } catch (error) {
      console.error('❌ Failed to initialize Google Speech client:', error.message);
      throw error;
    }
  }

  async transcribeAudio(filePath, languageCode = 'en-IN') {
    try {
      console.log('🔄 Starting Google Speech-to-Text transcription...');

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('Audio file not found');
      }

      // Read audio file
      const fileBuffer = fs.readFileSync(filePath);
      const audioBytes = fileBuffer.toString('base64');

      // Configure request
      const request = {
        audio: {
          content: audioBytes,
        },
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: languageCode,
          enableAutomaticPunctuation: true,
          model: 'default',
          useEnhanced: true,
        },
      };

      console.log('📡 Sending to Google Speech API...');
      
      // Detect speech
      const [response] = await this.client.recognize(request);
      
      if (!response.results || response.results.length === 0) {
        return 'No speech could be recognized. Please try again with clearer audio.';
      }

      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join(' ')
        .trim();

      console.log('✅ Transcription successful!');
      
      return transcription;

    } catch (error) {
      console.error('❌ Google Speech API Error:', error.message);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }
}

module.exports = new GoogleSpeechService();