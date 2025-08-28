import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Mic, Square, Loader, CheckCircle, XCircle, ChevronDown } from 'react-feather';
import './App.css';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [transcriptionHistory, setTranscriptionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

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
        headers: { 'Content-Type': 'multipart/form-data' },
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>LegalEase</h1>
        <p>Voice-based Legal Form Assistant</p>
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
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="btn btn-history"
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>

          {showHistory && (
            <div className="history-panel">
              {transcriptionHistory.length === 0 ? (
                <p className="placeholder">No transcription history yet.</p>
              ) : (
                <>
                  <div className="history-list">
                    {transcriptionHistory.map((item) => (
                      <div key={item.id} className="history-item">
                        <div className="history-item-header">
                          <span className="history-time">{item.timestamp}</span>
                          <span className="history-language">{item.language.toUpperCase()}</span>
                        </div>
                        <p className="history-text">{item.text}</p>
                        <button 
                          onClick={() => loadFromHistory(item)}
                          className="btn btn-load"
                        >
                          Load
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={clearHistory} className="btn btn-clear">
                    Clear History
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;