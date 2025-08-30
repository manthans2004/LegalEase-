const express = require('express');
const router = express.Router();
const Transcription = require('../models/Transcription');
const auth = require('../middleware/auth');

// GET /api/users/stats - Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total transcriptions count
    const totalTranscriptions = await Transcription.countDocuments({ user: userId });

    // Get last transcription date
    const lastTranscription = await Transcription.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .select('createdAt');

    // Get languages used with counts
    const languageStats = await Transcription.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get transcription status counts
    const statusStats = await Transcription.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Format the response
    const stats = {
      totalTranscriptions,
      lastActivity: lastTranscription ? lastTranscription.createdAt : null,
      languagesUsed: languageStats.map(item => ({
        language: item._id,
        count: item.count
      })),
      statusDistribution: statusStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

module.exports = router;