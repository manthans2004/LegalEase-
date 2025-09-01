const GoogleSpeechService = require('./services/googleSpeechService');

async function testConnection() {
  try {
    console.log('Testing Google Cloud connection...');
    
    // Test if client initialized successfully
    if (GoogleSpeechService.client) {
      console.log('✅ Google Speech client initialized successfully!');
      
      // Test project ID
      const projectId = await GoogleSpeechService.client.getProjectId();
      console.log('📋 Project ID:', projectId);
      
    } else {
      console.log('❌ Client not initialized');
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();