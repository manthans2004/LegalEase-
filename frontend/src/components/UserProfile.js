import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, BarChart, LogOut, X } from 'react-feather';
import './UserProfile.css';

const UserProfile = ({ onClose }) => {
  const { user, logout } = useAuth();
  const [userStats, setUserStats] = useState({
    totalTranscriptions: 0,
    lastTranscription: null,
    languagesUsed: []
  });

  useEffect(() => {
    // In a real app, we would fetch this from /api/users/stats
    // For now, we'll use mock data
    setUserStats({
      totalTranscriptions: 12,
      lastTranscription: '2 hours ago',
      languagesUsed: ['English', 'Hindi', 'Tamil']
    });
  }, []);

  const handleLogout = () => {
    logout();
    onClose();
  };

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
                Member since {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Statistics Card */}
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
                <span className="stat-text">{userStats.lastTranscription || 'Never'}</span>
                <span className="stat-label">Last Activity</span>
              </div>
            </div>
          </div>

          {/* Languages Card */}
          {userStats.languagesUsed.length > 0 && (
            <div className="languages-card">
              <h4>Languages Used</h4>
              <div className="languages-list">
                {userStats.languagesUsed.map((language, index) => (
                  <span key={index} className="language-tag">
                    {language}
                  </span>
                ))}
              </div>
            </div>
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