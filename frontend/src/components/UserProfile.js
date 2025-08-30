import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, BarChart, LogOut, X, Loader } from 'react-feather';
import axios from 'axios';
import './UserProfile.css';

const UserProfile = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users/stats');
      setUserStats(response.data.stats);
      setError('');
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="profile-modal-overlay">
        <div className="profile-modal-container">
          <div className="profile-loading">
            <Loader className="spin" size={48} />
            <p>Loading your statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-container">
        <div className="profile-modal-header">
          <h2>User Profile</h2>
          <button className="profile-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="profile-content">
          {/* User Info Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              <User size={32} />
            </div>
            <div className="profile-info">
              <h3>{user.username}</h3>
              <p className="profile-email">
                <Mail size={14} />
                {user.email}
              </p>
              <p className="profile-member-since">
                <Calendar size={14} />
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {error && (
            <div className="profile-error">
              <p>{error}</p>
              <button onClick={fetchUserStats} className="retry-btn">Retry</button>
            </div>
          )}

          {/* Statistics Card */}
          {userStats && (
            <>
              <div className="stats-card">
                <h4>
                  <BarChart size={18} />
                  Usage Statistics
                </h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{userStats.totalTranscriptions}</span>
                    <span className="stat-label">Total Transcriptions</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{userStats.languagesUsed.length}</span>
                    <span className="stat-label">Languages Used</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-text">{formatDate(userStats.lastActivity)}</span>
                    <span className="stat-label">Last Activity</span>
                  </div>
                </div>
              </div>

              {/* Languages Card */}
              {userStats.languagesUsed.length > 0 && (
                <div className="languages-card">
                  <h4>Languages Used</h4>
                  <div className="languages-list">
                    {userStats.languagesUsed.map((lang, index) => (
                      <span key={index} className="language-tag">
                        {formatLanguageName(lang.language)} ({lang.count})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Distribution Card */}
              {userStats.statusDistribution && (
                <div className="stats-card">
                  <h4>Status Distribution</h4>
                  <div className="status-grid">
                    {Object.entries(userStats.statusDistribution).map(([status, count]) => (
                      <div key={status} className="status-item">
                        <span className="status-name">{status}</span>
                        <span className="status-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Logout Button */}
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;