// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const transcribeRoutes = require('./routes/transcribe');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/users', userRoutes);

// Debug middleware - Add this to see what's happening with requests
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Body:', req.body);
  next();
});

// ==================== DATABASE CONNECTION ====================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in the .env file.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ==================== ROUTES ====================
// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: '🚀 LegalEase Server is up and running!' });
});

// API routes
app.use('/api/transcribe', transcribeRoutes);
app.use('/api/auth', authRoutes); // This was missing!

// ==================== SERVER START ====================
app.listen(PORT, () => {
  console.log(`🔊 Server is listening on port ${PORT}`);
  console.log(`📍 Visit http://localhost:${PORT}/api/health to test it`);
});