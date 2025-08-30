const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Transcription = require('../models/Transcription');
const auth = require('../middleware/auth'); // Import auth middleware
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// POST /api/transcribe - Now protected with optional auth
router.post('/', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an audio file' });
  }

  const { language = 'en' } = req.body;
  let userId = null;

  try {
    console.log('📥 New transcription request for language:', language);

    // Check if user is authenticated
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        userId = decoded.userId;
        console.log('👤 Authenticated user:', userId);
      } catch (authError) {
        console.log('👤 No valid authentication - proceeding as anonymous');
      }
    }

    // Create new Transcription record
    const newTranscription = new Transcription({
      user: userId, // Will be null for anonymous users
      originalName: req.file.originalname,
      filePath: req.file.path,
      language: language,
      status: 'pending'
    });

    const savedTranscription = await newTranscription.save();
    console.log('💾 Transcription record saved to DB:', savedTranscription._id);

    // SIMULATION: Replace this with real Bhashini API call later
    console.log('⏳ Simulating call to BHASHINI API...');

    setTimeout(async () => {
      try {
        const mockTranscribedText = "This is a mock transcription. Please configure the BHASHINI API keys to get real transcriptions.";

        // Update the Transcription record
        savedTranscription.transcribedText = mockTranscribedText;
        savedTranscription.status = 'completed';
        await savedTranscription.save();
        
        console.log('✅ Transcription completed successfully');

        // Send response
        res.json({
          success: true,
          message: 'Transcription successful',
          transcriptionId: savedTranscription._id,
          text: mockTranscribedText,
          isAuthenticated: !!userId // Tell frontend if user is logged in
        });

      } catch (updateError) {
        console.error('❌ Error updating transcription:', updateError);
        res.status(500).json({ error: 'Failed to finalize transcription' });
      }
    }, 3000);

  } catch (dbError) {
    console.error('❌ Database error:', dbError);
    res.status(500).json({ error: 'Server error while processing your request' });
  }
});

// GET /api/transcribe/history - Get user's transcription history (PROTECTED)
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const transcriptions = await Transcription.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-filePath -__v') // Exclude sensitive/unnecessary fields
      .lean(); // Better performance

    const total = await Transcription.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      transcriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch transcription history' });
  }
});
// DELETE /api/transcribe/:id - Delete a transcription (PROTECTED)
router.delete('/:id', auth, async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);
    
    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }

    // Check if user owns this transcription
    if (transcription.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the audio file from storage
    try {
      if (fs.existsSync(transcription.filePath)) {
        fs.unlinkSync(transcription.filePath);
      }
    } catch (fileError) {
      console.warn('⚠️ Could not delete audio file:', fileError);
    }

    // Delete from database
    await Transcription.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Transcription deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting transcription:', error);
    res.status(500).json({ error: 'Failed to delete transcription' });
  }
});
// GET /api/transcribe/:id - Get specific transcription (check ownership if authenticated)
router.get('/:id', async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);
    
    if (!transcription) {
      return res.status(404).json({ error: 'Transcription not found' });
    }

    // If user is authenticated, check if they own this transcription
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        
        if (transcription.user && transcription.user.toString() !== decoded.userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } catch (authError) {
        // Continue without authentication check
      }
    }

    res.json(transcription);
  } catch (error) {
    console.error('❌ Error fetching transcription:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// GET /api/transcribe/history - Now with search and filters
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', language = '', status = '' } = req.query;
    
    // Build search query
    let query = { user: req.user._id };
    
    if (search) {
      query.transcribedText = { $regex: search, $options: 'i' }; // Case-insensitive search
    }
    
    if (language) {
      query.language = language;
    }
    
    if (status) {
      query.status = status;
    }

    const transcriptions = await Transcription.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-filePath -__v')
      .lean();

    const total = await Transcription.countDocuments(query);

    res.json({
      success: true,
      transcriptions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      hasMore: page < Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch transcription history' });
  }
});

module.exports = router;