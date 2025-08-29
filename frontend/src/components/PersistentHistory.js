import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transcriptionService } from '../services/transcriptionService';
import { Loader, Trash2, Calendar, Clock, FileText } from 'react-feather';
import './PersistentHistory.css';

const PersistentHistory = ({ onSelectTranscription, onClose }) => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, currentPage]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await transcriptionService.getHistory(currentPage, 10);
      setTranscriptions(data.transcriptions);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err) {
      setError('Failed to load history');
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this transcription?')) {
      return;
    }

    try {
      await transcriptionService.deleteTranscription(id);
      setTranscriptions(transcriptions.filter(t => t._id !== id));
    } catch (err) {
      setError('Failed to delete transcription');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="persistent-history">
        <div className="history-placeholder">
          <FileText size={48} />
          <h3>Login to access your history</h3>
          <p>Your transcription history will be saved across devices when you're logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="persistent-history">
      <div className="history-header">
        <h3>Your Transcription History</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {loading && (
        <div className="history-loading">
          <Loader className="spin" size={32} />
          <p>Loading your history...</p>
        </div>
      )}

      {error && (
        <div className="history-error">
          <p>{error}</p>
          <button onClick={fetchHistory} className="retry-btn">Retry</button>
        </div>
      )}

      {!loading && transcriptions.length === 0 && (
        <div className="history-empty">
          <FileText size={48} />
          <h4>No transcriptions yet</h4>
          <p>Your transcriptions will appear here once you start using the app.</p>
        </div>
      )}

      <div className="history-list">
        {transcriptions.map((transcription) => (
          <div
            key={transcription._id}
            className="history-item"
            onClick={() => onSelectTranscription(transcription)}
          >
            <div className="item-header">
              <span className="language-badge">{transcription.language.toUpperCase()}</span>
              <span className="status-badge status-completed">{transcription.status}</span>
              <button
                onClick={(e) => handleDelete(transcription._id, e)}
                className="delete-btn"
                title="Delete transcription"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            <div className="item-content">
              <p className="transcription-text">
                {transcription.transcribedText.length > 150
                  ? transcription.transcribedText.substring(0, 150) + '...'
                  : transcription.transcribedText
                }
              </p>
            </div>

            <div className="item-footer">
              <span className="date-info">
                <Calendar size={12} />
                {formatDate(transcription.createdAt)}
              </span>
              <span className="duration-info">
                <Clock size={12} />
                {transcription.duration || 'N/A'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="history-pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <span>Page {currentPage} of {totalPages}</span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PersistentHistory;