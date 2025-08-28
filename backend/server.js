// server.js
// Import necessary libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const transcribeRoutes = require('./routes/transcribe');
require('dotenv').config(); // Loads environment variables from .env file

// Create an Express application
const app = express();
const PORT = process.env.PORT || 5000; // Use the port from .env or default to 5000

// ==================== MIDDLEWARE ====================
// CORS: Allows requests from other origins (like our React frontend)
app.use(cors());
// Express.json: Parses incoming requests with JSON payloads
app.use(express.json({ limit: '10mb' })); // Increase limit for potential base64 audio

// ==================== DATABASE CONNECTION ====================
// Get the MongoDB connection string from the environment variables
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in the .env file.');
  process.exit(1); // Stop the server if the URI is missing
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ==================== BASIC TEST ROUTE ====================
// Define a simple route to check if the server is working
app.get('/api/health', (req, res) => {
  res.json({ message: '🚀 LegalEase Server is up and running!' });
});
app.use('/api/transcribe', transcribeRoutes);

// ==================== SERVER START ====================
// Start listening for requests on the specified port
app.listen(PORT, () => {
  console.log(`🔊 Server is listening on port ${PORT}`);
  console.log(`📍 Visit http://localhost:${PORT}/api/health to test it`);
});