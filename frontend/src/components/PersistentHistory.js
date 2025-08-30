import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transcriptionService } from '../services/transcriptionService';
import { Loader, Trash2, Calendar, Clock, FileText, Search, X } from 'react-feather';
import './PersistentHistory.css';

const PersistentHistory = ({ onSelectTranscription, onClose }) => {
  const [transcriptions, setTranscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user, currentPage]);

  const fetchHistory = async (pageNum = currentPage, search = searchTerm) => {
    try {
      setIsSearching(true);
      const data = await transcriptionService.getHistory(pageNum, 10, search);
      setTranscriptions(data.transcriptions);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalItems(data.total);
      setError('');
    } catch (err) {
      setError('Failed to load history');
      console.error('History fetch error:', err);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHistory(1, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchHistory(1, '');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this transcription?')) {
      return;
    }

    try {
      await transcriptionService.deleteTranscription(id);
      setTranscriptions(transcriptions.filter(t => t._id !== id));
      fetchHistory(currentPage, searchTerm);
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

  const formatLanguageName = (code) => {
    const languageNames = {
      en: 'English',
      hi: 'Hindi',
      ta: 'Tamil',
      te: 'Telugu',
      kn: 'Kannada',
      ml: 'Malayalam',
      bn: 'Bengali',
      mr: 'Marathi'
    };
    return languageNames[code] || code.toUpperCase();
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

      {/* Simple Search Box */}
      <div className="search-box-simple">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search your transcriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              disabled={loading}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="clear-search-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="search-btn" disabled={loading}>
            Search
          </button>
        </form>
      </div>

      {!loading && !isSearching && totalItems > 0 && (
        <div className="search-stats">
          Found {totalItems} transcription{totalItems !== 1 ? 's' : ''}
          {searchTerm && ' for "' + searchTerm + '"'}
        </div>
      )}

      {(loading || isSearching) && (
        <div className="history-loading">
          <Loader className="spin" size={32} />
          <p>{isSearching ? 'Searching...' : 'Loading your history...'}</p>
        </div>
      )}

      {error && (
        <div className="history-error">
          <p>{error}</p>
          <button onClick={() => fetchHistory()} className="retry-btn">Retry</button>
        </div>
      )}

      {!loading && !isSearching && transcriptions.length === 0 && (
        <div className="history-empty">
          <FileText size={48} />
          <h4>
            {searchTerm ? 'No matching transcriptions' : 'No transcriptions yet'}
          </h4>
          <p>
            {searchTerm 
              ? 'Try a different search term'
              : 'Your transcriptions will appear here once you start using the app'
            }
          </p>
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
              <span className="language-badge">
                {formatLanguageName(transcription.language)}
              </span>
              <span className={`status-badge status-${transcription.status}`}>
                {transcription.status}
              </span>
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
                {transcription.transcribedText && transcription.transcribedText.length > 150
                  ? transcription.transcribedText.substring(0, 150) + '...'
                  : transcription.transcribedText || 'No transcription text available'
                }
              </p>
            </div>

            <div className="item-footer">
              <span className="date-info">
                <Calendar size={12} />
                {formatDate(transcription.createdAt)}
              </span>
              {transcription.duration && (
                <span className="duration-info">
                  <Clock size={12} />
                  {transcription.duration}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="history-pagination">
          <button
            onClick={() => {
              const newPage = Math.max(currentPage - 1, 1);
              setCurrentPage(newPage);
              fetchHistory(newPage, searchTerm);
            }}
            disabled={currentPage === 1 || isSearching}
          >
            Previous
          </button>
          
          <span>Page {currentPage} of {totalPages}</span>
          
          <button
            onClick={() => {
              const newPage = Math.min(currentPage + 1, totalPages);
              setCurrentPage(newPage);
              fetchHistory(newPage, searchTerm);
            }}
            disabled={currentPage === totalPages || isSearching}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PersistentHistory;