// models/Transcription.js
const mongoose = require('mongoose');

// Define the structure of a Transcription document in our database
const TranscriptionSchema = new mongoose.Schema({
  // The original name of the uploaded audio file
  originalName: {
    type: String,
    required: true
  },
  // The path where Multer will save the file on our server
  filePath: {
    type: String,
    required: true
  },
  // The language code of the audio (e.g., 'hi' for Hindi, 'en' for English)
  language: {
    type: String,
    required: true,
    default: 'en' // Default to English
  },
  // The transcribed text we get back from BHASHINI
  transcribedText: {
    type: String,
    default: '' // Will be empty initially, filled after API call
  },
  // The status of the transcription process
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  // Any error message if the process fails
  error: {
    type: String,
    default: ''
  }
}, {
  // Automatically add `createdAt` and `updatedAt` fields
  timestamps: true
});

// Create a model from the schema and export it
// This model will allow us to perform CRUD operations on a collection called 'transcriptions'
module.exports = mongoose.model('Transcription', TranscriptionSchema);