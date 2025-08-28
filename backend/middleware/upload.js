// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configure where to store uploaded files and what to name them
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create the path to the 'uploads' directory
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath); // Save files to ./backend/uploads/
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid overwrites: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Filter to only allow audio files
const fileFilter = (req, file, cb) => {
  // Check if the file's MIME type starts with 'audio/' OR is a common web audio format
  if (file.mimetype.startsWith('audio/') || 
      file.mimetype === 'audio/webm' ||
      file.mimetype === 'audio/mpeg' ||
      file.mimetype === 'audio/wav' ||
      file.mimetype === 'audio/mp4' ||
      file.mimetype === 'audio/x-m4a' ||
      file.mimetype === 'audio/ogg') {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only audio files are allowed! Received: ' + file.mimetype), false); // Reject the file
  }
};

// Create the Multer middleware instance with our configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limit files to 10MB
  }
});

module.exports = upload;