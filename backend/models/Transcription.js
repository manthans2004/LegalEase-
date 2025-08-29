const mongoose = require('mongoose');

const TranscriptionSchema = new mongoose.Schema({
  // Add user reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous transcriptions too
  },
  
  originalName: {
    type: String,
    required: true
  },
  
  filePath: {
    type: String,
    required: true
  },
  
  language: {
    type: String,
    required: true,
    default: 'en'
  },
  
  transcribedText: {
    type: String,
    default: ''
  },
  
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  
  error: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transcription', TranscriptionSchema);