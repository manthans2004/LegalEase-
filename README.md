LegalEase 🎙️⚖️
A full-stack voice-based legal form assistant that converts multilingual speech input into structured legal documents, empowering citizens to file applications without prior legal expertise.

✨ Features
Multilingual Voice Recording: Capture audio directly in the browser.

Speech-to-Text Transcription: Backend integrated for audio processing (Bhashini API integration ready).

Language Selection: Support for multiple Indian languages (English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi).

Transcription History: View and reload previous transcriptions.

Modern React Frontend: Clean, responsive UI built with React.js.

Robust Node.js Backend: RESTful API with Express.js and MongoDB.

🛠️ Tech Stack
Frontend: React.js, Axios, React Feather Icons

Backend: Node.js, Express.js, Multer (file uploads)

Database: MongoDB Atlas (Cloud)

Audio Processing: Web MediaRecorder API, Bhashini API (Ready for integration)

🚀 Getting Started
Prerequisites
Node.js

MongoDB Atlas Account

Bhashini API Credentials (For full functionality)

Installation
Clone the repository:

bash
git clone https://github.com/your-username/LegalEase.git
cd LegalEase
Set up the Backend:

bash
cd backend
npm install
cp .env.example .env  # Add your MongoDB and Bhashini credentials
npm run dev
Set up the Frontend:

bash
cd ../frontend
npm install
npm start
Open http://localhost:3000 to use the application.

📁 Project Structure
text
legalease/
├── backend/
│   ├── models/          # MongoDB models (Transcription)
│   ├── routes/          # API Routes (transcribe.js)
│   ├── middleware/      # Custom middleware (upload.js)
│   ├── services/        # Business logic (bhashiniService.js)
│   ├── uploads/         # Audio files storage
│   └── server.js        # Main server file
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
🔌 API Endpoints
POST /api/transcribe - Upload audio for transcription

GET /api/transcribe/:id - Get specific transcription

GET /api/health - Server health check

🎯 Usage
Record: Click the microphone button and speak your legal statement

Select Language: Choose from supported Indian languages

Transcribe: Process your audio to text

Review: Check your transcription history and edit if needed

Export: Generate legal documents from transcribed text (Coming soon)

🔮 Roadmap
User Authentication & Persistent History

Bhashini API Integration

Legal Document Templates (Rental Agreements, Affidavits, etc.)

Document Review & Edit Flow

Export to PDF/DOCX functionality

Multi-user support with role-based access

Deployment with HTTPS security

Mobile app development

🐛 Troubleshooting
Common Issues:

Microphone access not granted - ensure browser permissions

CORS errors - check backend server is running on port 5000

MongoDB connection issues - verify connection string in .env file

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check issues page.

Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Bhashini Platform for multilingual speech-to-text capabilities

React community for excellent documentation

MongoDB Atlas for cloud database services

📞 Contact
Manthan S - manthansreddy@gmail.com

Project Link: https://github.com/your-username/LegalEase

Disclaimer: This tool is designed for assistance only and is not a substitute for professional legal advice. Always consult with a qualified legal professional for important legal matters.