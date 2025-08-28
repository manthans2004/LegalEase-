// routes/transcribe.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Transcription = require('../models/Transcription');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data'); // To prepare the file for sending to BHASHINI

// POST /api/transcribe
// This endpoint uses the Multer middleware to handle a single file upload from a field named 'audio'
router.post('/', upload.single('audio'), async (req, res) => {
  // 1. Check if a file was actually uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an audio file' });
  }

  // 2. Get the language from the request body (e.g., 'en', 'hi')
  const { language = 'en' } = req.body;

  try {
    console.log(`📥 New transcription request for language: ${language}`);

    // 3. Create a new Transcription record in DB with status 'pending'
    const newTranscription = new Transcription({
      originalName: req.file.originalname,
      filePath: req.file.path,
      language: language,
      status: 'pending'
    });
    const savedTranscription = await newTranscription.save();
    console.log('💾 Transcription record saved to DB:', savedTranscription._id);

    // 4. Prepare to send the audio file to BHASHINI API
    //    We will simulate this for now by setting a timeout and generating mock text.
    //    WHY? Because we need BHASHINI API credentials, which we'll get next.
    console.log('⏳ Simulating call to BHASHINI API...');

    // SIMULATION: Wait 3 seconds and then return mock text
    setTimeout(async () => {
      try {
        const mockTranscribedText = "This is a mock transcription. Please configure the BHASHINI API keys to get real transcriptions.";

        // 5. Update the Transcription record in DB with the result
        savedTranscription.transcribedText = mockTranscribedText;
        savedTranscription.status = 'completed';
        await savedTranscription.save();
        console.log('✅ Transcription completed successfully');

        // 6. Send the successful response back to the frontend client
        res.json({
          success: true,
          message: 'Transcription successful',
          transcriptionId: savedTranscription._id,
          text: mockTranscribedText
        });

      } catch (updateError) {
        console.error('❌ Error updating transcription after simulation:', updateError);
        // Attempt to send an error response
        try {
          res.status(500).json({ error: 'Failed to finalize transcription' });
        } catch (responseError) {
          console.error('❌ Could not send error response:', responseError);
        }
      }
    }, 3000); // Simulate a 3-second API delay

    // NOTE: We are using setTimeout, so the response is sent asynchronously.
    // This means we don't call res.json() immediately inside the try block.

  } catch (dbError) {
    // Catch any errors related to saving to the database
    console.error('❌ Database error:', dbError);
    res.status(500).json({ error: 'Server error while processing your request' });
  }
});

// GET /api/transcribe/:id
// Optional: An endpoint to get the status or result of a previous transcription
router.get('/:id', async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);
    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }
    res.json(transcription);
  } catch (error) {
    console.error('❌ Error fetching transcription:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;