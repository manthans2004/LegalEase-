const { OpenAI } = require('openai');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class OpenAIService {
  constructor() {
    this.client = openai;
  }

  async transcribeAudio(filePath, language = 'en') {
    try {
      console.log('🎙️ Starting OpenAI Whisper transcription...');
      
      const transcription = await this.client.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        language: language,
        response_format: 'text',
      });

      console.log('✅ OpenAI transcription successful');
      return transcription;

    } catch (error) {
      console.error('❌ OpenAI transcription error:', error);
      throw new Error(`OpenAI transcription failed: ${error.message}`);
    }
  }

  // Optional: For more advanced processing later
  async extractLegalEntities(text) {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a legal assistant. Extract key legal entities from the text: names, dates, addresses, amounts, and legal terms.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 500,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI entity extraction error:', error);
      return null;
    }
  }
}

module.exports = new OpenAIService();