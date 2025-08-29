import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, Square, Loader, CheckCircle, XCircle, ChevronDown, User, LogOut } from 'react-feather';
import { useAuth } from './context/AuthContext';
import AuthForms from './components/AuthForms';
import UserProfile from './components/UserProfile';
import './App.css';
import PersistentHistory from './components/PersistentHistory';


const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  // eslint-disable-next-line no-unused-vars
  const [transcriptionHistory, setTranscriptionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPersistentHistory, setShowPersistentHistory] = useState(false);
  
  const { user, logout, loading } = useAuth(); 

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'bn', name: 'Bengali' },
    { code: 'mr', name: 'Marathi' },
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setStatus('recording');
      setErrorMessage('');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatus('error');
      setErrorMessage('Cannot access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('idle');
    }
  };

  const saveToHistory = (transcriptionData) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      text: transcriptionData.text,
      language: selectedLanguage,
      status: 'success'
    };
    setTranscriptionHistory(prev => [historyItem, ...prev].slice(0, 10));
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', selectedLanguage);

    setStatus('uploading');
    setErrorMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setTranscription(response.data.text);
      setStatus('success');
      saveToHistory(response.data);
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
      setErrorMessage(err.response?.data?.error || 'Failed to transcribe audio. Please try again.');
    }
  };

  const resetAll = () => {
    setAudioBlob(null);
    setTranscription('');
    setStatus('idle');
    setErrorMessage('');
  };

  const clearHistory = () => {
    setTranscriptionHistory([]);
  };

  const loadFromHistory = (item) => {
    setTranscription(item.text);
    setSelectedLanguage(item.language);
    setStatus('success');
    setShowHistory(false);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <Loader className="spin" size={48} />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>LegalEase</h1>
            <p>Voice-based Legal Form Assistant</p>
          </div>
          <div className="header-auth">
            {user ? (
              <div className="user-info">
                <span>Welcome, {user.username}</span>
                <button 
                  onClick={() => setShowProfileModal(true)} 
                  className="btn btn-profile"
                  title="View Profile"
                >
                  <User size={16} />
                </button>
                <button onClick={logout} className="btn btn-logout" title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn btn-login">
                <User size={16} />
                Login / Register
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="card">
          <h2>1. Record Your Statement</h2>
          <div className="language-selector">
            <label htmlFor="language">Select Language: </label>
            <div className="select-wrapper">
              <select 
                id="language"
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isRecording}
                className="language-dropdown"
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="select-arrow" />
            </div>
          </div>
          <div className="button-container">
            {!isRecording ? (
              <button onClick={startRecording} className="btn btn-record">
                <Mic size={20} /> Start Recording
              </button>
            ) : (
              <button onClick={stopRecording} className="btn btn-stop">
                <Square size={20} /> Stop Recording
              </button>
            )}
          </div>
          {audioBlob && (
            <div className="audio-preview">
              <p>Recording complete! Ready to transcribe.</p>
              <audio src={URL.createObjectURL(audioBlob)} controls />
            </div>
          )}
        </section>

        <section className="card">
          <h2>2. Transcribe</h2>
          <button
            onClick={uploadAudio}
            disabled={!audioBlob || status === 'uploading'}
            className="btn btn-transcribe"
          >
            {status === 'uploading' ? (
              <>
                <Loader className="spin" size={20} />
                <span>Transcribing...</span>
              </>
            ) : (
              'Transcribe Recording'
            )}
          </button>
        </section>

        <section className="card">
          <h2>3. Transcription Result</h2>
          <div className="result-container">
            {status === 'success' && <CheckCircle className="icon-success" size={48} />}
            {status === 'error' && <XCircle className="icon-error" size={48} />}

            {transcription ? (
              <div className="transcription-text">
                <p>{transcription}</p>
              </div>
            ) : (
              <p className="placeholder">
                {status === 'uploading'
                  ? 'Transcribing...'
                  : status === 'error'
                  ? 'Error occurred.'
                  : 'Your transcribed text will appear here.'}
              </p>
            )}

            {errorMessage && (
              <div className="error-message">
                <XCircle size={20} />
                <p>{errorMessage}</p>
                <button 
                  onClick={() => setErrorMessage('')} 
                  className="btn-dismiss"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            {(transcription || status === 'error') && (
              <button onClick={resetAll} className="btn btn-reset">
                Start Over
              </button>
            )}
          </div>
        </section>

        <section className="card">
  <div className="history-header">
    <h2>Transcription History</h2>
    <div className="history-actions">
      <button 
        onClick={() => setShowHistory(!showHistory)}
        className="btn btn-history"
      >
        {showHistory ? 'Hide Local History' : 'Show Local History'}
      </button>
      {user && (
        <button 
          onClick={() => setShowPersistentHistory(true)}
          className="btn btn-persistent-history"
        >
          Cloud History
        </button>
      )}
    </div>
  </div>

  {showHistory && (
    <div className="history-panel">
      {/* Local history content remains the same */}
    </div>
  )}
</section>
      </main>

      {showAuthModal && (
        <AuthForms onClose={() => setShowAuthModal(false)} />
      )}
      {showProfileModal && (
        <UserProfile onClose={() => setShowProfileModal(false)} />
      )}
      {showPersistentHistory && (
  <PersistentHistory 
    onSelectTranscription={(transcription) => {
      setTranscription(transcription.transcribedText);
      setSelectedLanguage(transcription.language);
      setStatus('success');
      setShowPersistentHistory(false);
    }}
    onClose={() => setShowPersistentHistory(false)}
  />
)}
    </div>
  );
}

export default App;
